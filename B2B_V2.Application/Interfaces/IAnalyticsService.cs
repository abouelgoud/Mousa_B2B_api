using B2B_V2.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IAnalyticsService
    {
        Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync(Guid id);
        Task<SLADashboardDto> GetSlaDashboardAsync(Guid? companyId, Guid? providerId);
        Task<IEnumerable<SLADetailDto>> GetSlaDetailsAsync(string metricType, Guid? companyId, Guid? providerId);
    }
}
