using B2B_V2.Application.DTOs;
using B2B_V2.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface ICaseService
    {
        Task<bool> SubmitMedicalResultsAsync(MedicalResultDto results);
        Task<bool> ReviewCaseAsync(CaseReviewDto review);
        Task<IEnumerable<RequestDto>> GetProviderWorklistAsync(Guid providerId);
        Task<IEnumerable<RequestDto>> GetAdminReviewQueueAsync(Guid? providerId = null);
        Task<IEnumerable<RequestDto>> GetGlobalWaitingQueueAsync();
        Task<IEnumerable<RequestDto>> GetArchivedCasesAsync();
        Task<RequestDto?> GetCaseDetailsAsync(Guid requestId);
        Task<bool> UpdateCaseStatusAsync(Guid requestId, RequestStatus status);
    }
}
