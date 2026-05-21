using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using B2B_V2.Application.Interfaces;

namespace B2B_V2.Application.Services
{
    public class CaseService : ICaseService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly Microsoft.Extensions.Logging.ILogger<CaseService> _logger;
        private readonly IFinancialService _financialService;

        public CaseService(IUnitOfWork unitOfWork, INotificationService notificationService, Microsoft.Extensions.Logging.ILogger<CaseService> logger, IFinancialService financialService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _logger = logger;
            _financialService = financialService;
        }

        public async Task<bool> SubmitMedicalResultsAsync(MedicalResultDto dto)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(dto.RequestId);
            if (request == null) return false;

            var medicalResult = new MedicalResult
            {
                RequestId = dto.RequestId,
                VitalSigns = dto.VitalSigns,
                LabFindings = dto.LabFindings,
                PhysicianNotes = dto.PhysicianNotes,
                IsFitForWork = dto.IsFitForWork,
                ResultDocumentPath = dto.ResultDocumentPath
            };

            await _unitOfWork.Repository<MedicalResult>().AddAsync(medicalResult);

            request.Status = RequestStatus.AuthorizedSubmitted; // Transition to authorized
            _unitOfWork.Repository<Request>().Update(request);

            var success = await _unitOfWork.CompleteAsync() > 0;
            if (success)
            {
                // Notify Admin for review
                // await _notificationService.SendNotificationAsync(...);
            }

            return success;
        }

        public async Task<bool> ReviewCaseAsync(CaseReviewDto dto)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(dto.RequestId);
            if (request == null) return false;

            var medicalResult = (await _unitOfWork.Repository<MedicalResult>().FindAsync(m => m.RequestId == dto.RequestId)).FirstOrDefault();
            if (medicalResult == null) return false;

            medicalResult.Approved = dto.Approved;
            medicalResult.ReviewedAt = DateTime.UtcNow;
            medicalResult.ReviewedBy = dto.AdminName;
            medicalResult.ReviewComments = dto.Comments;

            _unitOfWork.Repository<MedicalResult>().Update(medicalResult);

            request.Status = dto.Approved ? RequestStatus.AuthorizedSubmitted : RequestStatus.Rejected;
            _unitOfWork.Repository<Request>().Update(request);

            if (dto.Approved)
            {
                // Finalize settlement
                var records = await _unitOfWork.Repository<FinancialRecord>().FindAsync(f => f.RequestId == dto.RequestId);
                var record = records.FirstOrDefault();
                if (record != null)
                {
                    record.IsFinalized = true;
                    record.FinalizedAt = DateTime.UtcNow;
                    _unitOfWork.Repository<FinancialRecord>().Update(record);
                }
            }

            return await _unitOfWork.CompleteAsync() > 0;
        }

        public async Task<IEnumerable<RequestDto>> GetProviderWorklistAsync(Guid providerId)
        {
            var activeStatuses = new[] { 
                RequestStatus.Accepted, 
                RequestStatus.CheckedIn, 
                RequestStatus.ExaminationStarted
            };

            var requests = await _unitOfWork.Repository<Request>().GetAllAsync(r => r.Candidate, r => r.Package);
            return requests.Where(r => r.AssignedProviderId == providerId && activeStatuses.Contains(r.Status))
                           .Select(r => MapToDto(r));
        }

        public async Task<IEnumerable<RequestDto>> GetAdminReviewQueueAsync(Guid? providerId = null)
        {
            var requests = await _unitOfWork.Repository<Request>().GetAllAsync(r => r.Candidate, r => r.Package, r => r.AssignedProvider);
            
            var query = requests.Where(r => r.Status == RequestStatus.AuthorizedSubmitted);
            
            if (providerId.HasValue)
            {
                query = query.Where(r => r.AssignedProviderId == providerId.Value);
            }

            return query.Select(r => MapToDto(r));
        }

        public async Task<IEnumerable<RequestDto>> GetGlobalWaitingQueueAsync()
        {
            var activeStatuses = new[] { 
                RequestStatus.Pending,
                RequestStatus.Accepted, 
                RequestStatus.CheckedIn, 
                RequestStatus.ExaminationStarted
            };
            
            var requests = await _unitOfWork.Repository<Request>().GetAllAsync(r => r.Candidate, r => r.Package, r => r.AssignedProvider);
            return requests.Where(r => activeStatuses.Contains(r.Status))
                           .Select(r => MapToDto(r));
        }

        public async Task<IEnumerable<RequestDto>> GetArchivedCasesAsync()
        {
            var archivedStatuses = new[] { 
                RequestStatus.AuthorizedSubmitted,
                RequestStatus.Rejected,
                RequestStatus.Closed
            };
            
            var requests = await _unitOfWork.Repository<Request>().GetAllAsync(r => r.Candidate, r => r.Package, r => r.AssignedProvider);
            
            _logger.LogInformation($"Total requests found: {requests.Count()}");
            var statusCounts = requests.GroupBy(r => r.Status).Select(g => new { Status = g.Key, Count = g.Count() });
            foreach(var s in statusCounts)
            {
                _logger.LogInformation($"Status {s.Status}: {s.Count}");
            }

            var result = requests.Where(r => archivedStatuses.Contains(r.Status))
                           .Select(r => MapToDto(r));
            
            _logger.LogInformation($"Filtered archived cases count: {result.Count()}");
            return result;
        }

        public async Task<RequestDto?> GetCaseDetailsAsync(Guid requestId)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId, 
                r => r.Candidate!, r => r.Package!, r => r.RequestedProvider!, r => r.AssignedProvider!, r => r.Documents);
            return request != null ? MapToDto(request) : null;
        }

        public async Task<bool> UpdateCaseStatusAsync(Guid requestId, RequestStatus status)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId);
            if (request == null) return false;

            // Optional: Add validation logic for status transitions here
            // e.g., if (status == RequestStatus.UnderTesting && request.Status != RequestStatus.CandidateArrived) return false;

            if (status == RequestStatus.CheckedIn && request.Status != RequestStatus.CheckedIn)
            {
                request.ArrivedAt = DateTime.UtcNow;
            }
            else if (status == RequestStatus.ExaminationStarted && request.Status != RequestStatus.ExaminationStarted)
            {
                request.ExamStartedAt = DateTime.UtcNow;
            }
            else if (status == RequestStatus.AuthorizedSubmitted && request.Status != RequestStatus.AuthorizedSubmitted)
            {
                // Generate financial record when authorized
                await _financialService.GenerateFinancialRecordAsync(requestId);
            }

            request.Status = status;
            _unitOfWork.Repository<Request>().Update(request);
            
            _logger.LogInformation($"Updating case {requestId} status to {status}");
            
            return await _unitOfWork.CompleteAsync() > 0;
        }

        private RequestDto MapToDto(Request req)
        {
            return new RequestDto
            {
                Id = req.Id,
                CaseID = req.CaseID,
                CompanyId = req.CompanyId,
                CandidateId = req.CandidateId,
                CandidateFullName = req.Candidate?.FullName ?? "N/A",
                NationalID = req.Candidate?.NationalID ?? "N/A",
                PackageId = req.PackageId,
                PackageName = req.Package?.Name ?? "N/A",
                Status = req.Status,
                ExpectedVisitDate = req.ExpectedVisitDate,
                AssignedProviderId = req.AssignedProviderId,
                AssignedProviderName = req.AssignedProvider?.LegalName,
                ScreeningBatchId = req.ScreeningBatchId,
                ArrivedAt = req.ArrivedAt,
                ExamStartedAt = req.ExamStartedAt,
                Documents = req.Documents?.Select(d => new RequestDocumentDto
                {
                    Id = d.Id,
                    RequestId = d.RequestId,
                    DocumentType = d.DocumentType,
                    FilePath = d.FilePath,
                    UploadedAt = d.UploadedAt,
                    UploadedBy = d.UploadedByUserId.ToString()
                }).ToList() ?? new List<RequestDocumentDto>()
            };
        }
    }
}
