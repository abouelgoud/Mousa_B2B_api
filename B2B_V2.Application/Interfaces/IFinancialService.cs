using B2B_V2.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IFinancialService
    {
        Task<bool> GenerateFinancialRecordAsync(Guid requestId);
        Task<IEnumerable<FinancialRecordDto>> GetCompanyInvoicesAsync(Guid companyId);
        Task<IEnumerable<FinancialRecordDto>> GetProviderPayoutsAsync(Guid providerId);
        Task<FinancialSummaryDto> GetPlatformSummaryAsync();
        Task<bool> MarkAsPaidByCompanyAsync(Guid recordId);
        Task<bool> MarkAsPaidToProviderAsync(Guid recordId);
        Task<int> BackfillFinancialRecordsAsync();
    }
}
