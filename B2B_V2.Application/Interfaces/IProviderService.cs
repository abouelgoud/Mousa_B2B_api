using B2B_V2.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IProviderService
    {
        Task<IEnumerable<ProviderDto>> GetAllProvidersAsync();
        Task<ProviderDto?> GetProviderByIdAsync(Guid id);
        Task<ProviderDto> RegisterProviderAsync(ProviderRegistrationCreateDto providerDto);
        Task<bool> UpdateProviderAsync(Guid id, ProviderDto providerDto);
        Task<bool> ToggleProviderStatusAsync(Guid id, bool isActive);
        Task<IEnumerable<ProviderDto>> GetProvidersByLocationAsync(Guid companyId);
        Task<ProviderBranchDto> AddBranchAsync(Guid providerId, CreateProviderBranchDto branchDto);
        Task<bool> VerifyComplianceAuditAsync(Guid providerId, ComplianceAuditResultDto auditResult);
    }
}
