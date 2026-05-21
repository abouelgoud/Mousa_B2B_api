using B2B_V2.Application.DTOs;
using B2B_V2.Domain.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IRequestService
    {
        Task<IEnumerable<RequestDto>> CreateRequestBatchAsync(Guid companyId, CreateRequestDto createRequestDto, Guid userId = default);
        Task<IEnumerable<RequestDto>> GetCompanyRequestsAsync(Guid companyId);
        Task<RequestDto?> GetRequestByIdAsync(Guid id);
        Task<bool> UpdateRequestStatusAsync(Guid id, RequestStatus status, string? comment = null, Guid userId = default);
        Task<RequestDocumentDto> UploadDocumentAsync(Guid requestId, IFormFile file, Guid uploadedBy);
        Task<bool> AddAdditionalServicesAsync(Guid requestId, List<Guid> serviceIds, Guid userId);
        Task<bool> PullRequestAsync(Guid requestId, Guid providerId, Guid userId);
        Task<IEnumerable<RequestDto>> GetAvailableBroadcastsAsync();
    }
}
