using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("workforce/{id}")]
        public async Task<ActionResult<WorkforceAnalyticsDto>> GetWorkforceAnalytics(Guid id)
        {
            var userCompanyId = User.FindFirstValue("CompanyId");
            var userProviderId = User.FindFirstValue("ProviderId");

            bool isAuthorized = User.IsInRole("SuperAdministrator") ||
                                (!string.IsNullOrEmpty(userCompanyId) && Guid.TryParse(userCompanyId, out var cid) && cid == id) ||
                                (!string.IsNullOrEmpty(userProviderId) && Guid.TryParse(userProviderId, out var pid) && pid == id);

            if (!isAuthorized)
            {
                return Forbid();
            }

            var result = await _analyticsService.GetWorkforceAnalyticsAsync(id);
            return Ok(result);
        }
        [HttpGet("sla")]
        public async Task<ActionResult<SLADashboardDto>> GetSlaDashboard()
        {
            var userCompanyIdStr = User.FindFirstValue("CompanyId");
            var userProviderIdStr = User.FindFirstValue("ProviderId");

            Guid? companyId = string.IsNullOrEmpty(userCompanyIdStr) ? null : Guid.Parse(userCompanyIdStr);
            Guid? providerId = string.IsNullOrEmpty(userProviderIdStr) ? null : Guid.Parse(userProviderIdStr);

            var result = await _analyticsService.GetSlaDashboardAsync(companyId, providerId);
            return Ok(result);
        }
        [HttpGet("sla/details")]
        public async Task<ActionResult<IEnumerable<SLADetailDto>>> GetSlaDetails([FromQuery] string metricType = "all")
        {
            var userCompanyIdStr = User.FindFirstValue("CompanyId");
            var userProviderIdStr = User.FindFirstValue("ProviderId");

            Guid? companyId = string.IsNullOrEmpty(userCompanyIdStr) ? null : Guid.Parse(userCompanyIdStr);
            Guid? providerId = string.IsNullOrEmpty(userProviderIdStr) ? null : Guid.Parse(userProviderIdStr);

            var result = await _analyticsService.GetSlaDetailsAsync(metricType, companyId, providerId);
            return Ok(result);
        }
    }
}
