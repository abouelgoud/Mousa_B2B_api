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
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardDataDto>> GetDashboardData()
        {
            // Extract CompanyId and ProviderId from user claims
            var companyIdClaim = User.FindFirstValue("CompanyId");
            var providerIdClaim = User.FindFirstValue("ProviderId");

            Guid? companyId = !string.IsNullOrEmpty(companyIdClaim) ? Guid.Parse(companyIdClaim) : null;
            Guid? providerId = !string.IsNullOrEmpty(providerIdClaim) ? Guid.Parse(providerIdClaim) : null;

            var data = await _dashboardService.GetDashboardDataAsync(companyId: companyId, providerId: providerId);
            return Ok(data);
        }
    }
}
