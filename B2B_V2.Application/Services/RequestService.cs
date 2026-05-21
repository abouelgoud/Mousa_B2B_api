using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace B2B_V2.Application.Services
{
    public class RequestService : IRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;

        public RequestService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<RequestDto>> CreateRequestBatchAsync(Guid companyId, CreateRequestDto dto, Guid userId = default)
        {
            var batchId = Guid.NewGuid();
            var requests = new List<Request>();

            foreach (var candidateId in dto.CandidateIds)
            {
                var request = new Request
                {
                    CaseID = GenerateCaseId(),
                    CompanyId = companyId,
                    CandidateId = candidateId,
                    PackageId = dto.PackageId,
                    RequestedProviderId = dto.RequestedProviderId,
                    BranchId = dto.BranchId,
                    SupportingDocumentPath = dto.SupportingDocumentPath,
                    Status = RequestStatus.Pending,
                    ExpectedVisitDate = dto.ExpectedVisitDate,
                    ScreeningBatchId = batchId
                };
                requests.Add(request);
                await _unitOfWork.Repository<Request>().AddAsync(request);
            }

            await _unitOfWork.CompleteAsync();

            // Notify all company users
            var companyUsers = await _unitOfWork.Repository<ApplicationUser>()
                .FindAsync(u => u.CompanyId == companyId);
            foreach (var cu in companyUsers)
            {
                await _notificationService.SendNotificationAsync(
                    cu.Id,
                    $"Successfully created {dto.CandidateIds.Count} screening request(s). Batch ID: {batchId.ToString().Substring(0, 8)}",
                    NotificationType.InApp,
                    batchId);
            }

            // Notify provider if a provider was requested
            if (dto.RequestedProviderId.HasValue)
            {
                // Find the user account associated with this provider
                var providerUsers = await _unitOfWork.Repository<ApplicationUser>()
                    .FindAsync(u => u.ProviderId == dto.RequestedProviderId.Value);
                
                foreach (var providerUser in providerUsers)
                {
                    await _notificationService.SendNotificationAsync(
                        providerUser.Id,
                        $"New screening request assigned: {dto.CandidateIds.Count} candidate(s) from batch {batchId.ToString().Substring(0, 8)}",
                        NotificationType.InApp,
                        batchId);
                }
            }

            // Fetch with includes for mapping
            var createdRequests = await _unitOfWork.Repository<Request>().FindAsync(
                r => r.ScreeningBatchId == batchId,
                r => r.Candidate!,
                r => r.Package!,
                r => r.RequestedProvider!,
                r => r.AssignedProvider!,
                r => r.Branch!
            );

            return createdRequests.Select(r => MapToDto(r));
        }

        public async Task<IEnumerable<RequestDto>> GetCompanyRequestsAsync(Guid companyId)
        {
            var requests = await _unitOfWork.Repository<Request>().FindAsync(
                r => r.CompanyId == companyId,
                r => r.Candidate!,
                r => r.Package!,
                r => r.RequestedProvider!,
                r => r.AssignedProvider!,
                r => r.Branch!
            );
            return requests.Select(r => MapToDto(r));
        }

        public async Task<RequestDto?> GetRequestByIdAsync(Guid id)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(id, 
                new[] { "Package.PackageServices.Service" }, // Correctly include deep nested services
                r => r.Candidate!, 
                r => r.Package!, 
                r => r.RequestedProvider!, 
                r => r.AssignedProvider!, 
                r => r.Branch!,
                r => r.Documents,
                r => r.StatusLogs,
                r => r.AdditionalServices,
                r => r.Package!.PackageServices);
            return request != null ? MapToDto(request) : null;
        }

        public async Task<bool> UpdateRequestStatusAsync(Guid id, RequestStatus status, string? comment = null, Guid userId = default)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(id);
            if (request == null) return false;

            var oldStatus = request.Status;
            request.Status = status;

            // Log status change
            var log = new RequestStatusLog
            {
                RequestId = id,
                Status = status,
                Comment = comment,
                ChangedByUserId = userId,
                Timestamp = DateTime.UtcNow
            };
            await _unitOfWork.Repository<RequestStatusLog>().AddAsync(log);

            _unitOfWork.Repository<Request>().Update(request);

            var result = await _unitOfWork.CompleteAsync() > 0;

            if (result)
            {
                // Find Company users and notify them
                var companyUsers = await _unitOfWork.Repository<ApplicationUser>()
                    .FindAsync(u => u.CompanyId == request.CompanyId);
                foreach (var cu in companyUsers)
                {
                    await _notificationService.SendNotificationAsync(
                        cu.Id,
                        $"Request {request.CaseID} status changed from {oldStatus} to {status}.",
                        NotificationType.InApp,
                        request.Id);
                }

                if (request.AssignedProviderId.HasValue)
                {
                    // Find provider users and notify them too
                    var providerUsers = await _unitOfWork.Repository<ApplicationUser>()
                        .FindAsync(u => u.ProviderId == request.AssignedProviderId.Value);
                    foreach (var pu in providerUsers)
                    {
                        await _notificationService.SendNotificationAsync(
                            pu.Id,
                            $"Request {request.CaseID} status changed to {status}.",
                            NotificationType.InApp,
                            request.Id);
                    }
                }
            }

            return result;
        }

        public async Task<bool> AddAdditionalServicesAsync(Guid requestId, List<Guid> serviceIds, Guid userId)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId);
            if (request == null) return false;

            foreach (var serviceId in serviceIds)
            {
                var additionalService = new RequestAdditionalService
                {
                    RequestId = requestId,
                    ServiceId = serviceId,
                    AddedByUserId = userId,
                    AddedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<RequestAdditionalService>().AddAsync(additionalService);
            }

            // Resubmit if it was returned
            if (request.Status == RequestStatus.ReturnedForMoreTests)
            {
                request.Status = RequestStatus.ExaminationStarted; // Back to examination
                _unitOfWork.Repository<Request>().Update(request);
                
                // Log the resubmission
                var log = new RequestStatusLog
                {
                    RequestId = requestId,
                    Status = RequestStatus.ExaminationStarted,
                    Comment = "Resubmitted with additional services.",
                    ChangedByUserId = userId,
                    Timestamp = DateTime.UtcNow
                };
                await _unitOfWork.Repository<RequestStatusLog>().AddAsync(log);

                // Notify all company users
                var companyUsers = await _unitOfWork.Repository<ApplicationUser>()
                    .FindAsync(u => u.CompanyId == request.CompanyId);
                foreach (var cu in companyUsers)
                {
                    await _notificationService.SendNotificationAsync(
                        cu.Id,
                        $"Case {request.CaseID} has been resubmitted with additional services.",
                        NotificationType.InApp,
                        request.Id);
                }

                // Notify Assigned Provider
                if (request.AssignedProviderId.HasValue)
                {
                    var providerUsers = await _unitOfWork.Repository<ApplicationUser>()
                        .FindAsync(u => u.ProviderId == request.AssignedProviderId.Value);
                    foreach (var pu in providerUsers)
                    {
                        await _notificationService.SendNotificationAsync(
                            pu.Id,
                            $"Case {request.CaseID} has been resubmitted with additional services.",
                            NotificationType.InApp,
                            request.Id);
                    }
                }
            }

            return await _unitOfWork.CompleteAsync() > 0;
        }

        public async Task<RequestDocumentDto> UploadDocumentAsync(Guid requestId, Microsoft.AspNetCore.Http.IFormFile file, Guid uploadedBy)
        {
            if (file == null || file.Length == 0) throw new ArgumentException("File is empty");
            
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId);
            if (request == null) throw new KeyNotFoundException("Request not found");

            // Ensure directory exists
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "medical-documents");
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document entity
            var document = new RequestDocument
            {
                RequestId = requestId,
                DocumentType = "Medical Record", // Default type
                FilePath = $"/uploads/medical-documents/{fileName}", // Relative path for web access
                UploadedByUserId = uploadedBy,
                UploadedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<RequestDocument>().AddAsync(document);
            await _unitOfWork.CompleteAsync();

            return new RequestDocumentDto
            {
                Id = document.Id,
                RequestId = document.RequestId,
                DocumentType = document.DocumentType,
                FileName = file.FileName, // Store original name? Entity doesn't have it, let's use what we have or consider updating entity later. For now, return what we can.
                FilePath = document.FilePath,
                UploadedAt = document.UploadedAt,
                UploadedBy = uploadedBy.ToString() // Ideally fetch user name
            };
        }

        private string GenerateCaseId()
        {
            // Simple unique case ID generation logic
            return $"B2B-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
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
                AssignedProviderId = req.AssignedProviderId,
                AssignedProviderName = req.AssignedProvider?.LegalName,
                RequestedProviderId = req.RequestedProviderId,
                RequestedProviderName = req.RequestedProvider?.LegalName,
                BranchId = req.BranchId,
                BranchName = req.Branch?.Address,
                SupportingDocumentPath = req.SupportingDocumentPath,
                Status = req.Status,
                IsBroadcasted = req.IsBroadcasted,
                ExpectedVisitDate = req.ExpectedVisitDate,
                ScreeningBatchId = req.ScreeningBatchId,
                Documents = req.Documents?.Select(d => new RequestDocumentDto
                {
                    Id = d.Id,
                    RequestId = d.RequestId,
                    DocumentType = d.DocumentType,
                    FilePath = d.FilePath,
                    UploadedAt = d.UploadedAt,
                    UploadedBy = d.UploadedByUserId.ToString()
                }).ToList() ?? new List<RequestDocumentDto>(),
                StatusLogs = req.StatusLogs?.OrderByDescending(l => l.Timestamp).Select(l => new RequestStatusLogDto
                {
                    Id = l.Id,
                    Status = l.Status,
                    Comment = l.Comment,
                    Timestamp = l.Timestamp,
                    ChangedByName = l.ChangedByUserId.ToString() // Ideally fetch user name
                }).ToList() ?? new List<RequestStatusLogDto>(),
                AdditionalServices = req.AdditionalServices?.Select(s => new RequestAdditionalServiceDto
                {
                    Id = s.Id,
                    ServiceId = s.ServiceId,
                    ServiceName = s.Service?.Name ?? "N/A",
                    Price = s.Service?.Price ?? 0,
                    AddedAt = s.AddedAt
                }).ToList() ?? new List<RequestAdditionalServiceDto>(),
                PackageServices = req.Package?.PackageServices?.Select(ps => new ServiceDto
                {
                    Id = ps.ServiceId,
                    Name = ps.Service?.Name ?? "N/A",
                    Price = ps.Service?.Price ?? 0,
                    Description = ps.Service?.Description
                }).ToList() ?? new List<ServiceDto>()
            };
        }

        public async Task<IEnumerable<RequestDto>> GetAvailableBroadcastsAsync()
        {
            var requestsQuery = await _unitOfWork.Repository<Request>().FindAsync(
                r => r.IsBroadcasted == true && r.AssignedProviderId == null && r.Status == RequestStatus.Pending,
                r => r.Candidate,
                r => r.Package,
                r => r.AssignedProvider,
                r => r.Branch
            );

            return requestsQuery.Select(MapToDto).ToList();
        }

        public async Task<bool> PullRequestAsync(Guid requestId, Guid providerId, Guid userId)
        {
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId);
            if (request == null)
                return false;

            // Only allow pulling if it's broadcasted and not already assigned
            if (!request.IsBroadcasted || request.AssignedProviderId != null)
                return false; // Already pulled or not eligible

            request.AssignedProviderId = providerId;
            request.IsBroadcasted = false; // Claimed, so no longer broadcasted (optional depending on if we want to keep a record that it WAS broadcasted. We'll leave it as false so it drops from broadcast queues if any)
            request.Status = RequestStatus.Accepted;
            
            // Log status change or assignment change
            var log = new RequestStatusLog
            {
                RequestId = request.Id,
                Status = RequestStatus.Accepted,
                Comment = "Request pulled by provider and automatically accepted.",
                Timestamp = DateTime.UtcNow,
                ChangedByUserId = userId
            };

            _unitOfWork.Repository<Request>().Update(request);
            await _unitOfWork.Repository<RequestStatusLog>().AddAsync(log);

            var success = await _unitOfWork.CompleteAsync() > 0;
            return success;
        }
    }
}
