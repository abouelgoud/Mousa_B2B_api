using B2B_V2.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardDataDto> GetDashboardDataAsync(Guid? companyId = null, Guid? providerId = null);
    }
}
