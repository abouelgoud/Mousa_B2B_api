using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("analyze/{requestId}")]
        public async Task<ActionResult<AIRiskResultDto>> AnalyzeRisk(Guid requestId)
        {
            var result = await _aiService.AnalyzeScreeningRiskAsync(requestId);
            return Ok(result);
        }

        [HttpPost("compliance-audit")]
        public async Task<ActionResult<ComplianceAuditResultDto>> RunComplianceAudit([FromBody] ComplianceAuditRequestDto request)
        {
            var result = await _aiService.RunComplianceAuditAsync(request);
            return Ok(result);
        }

        [HttpGet("report/{requestId}")]
        public async Task<ActionResult<AIReportDto>> GenerateReport(Guid requestId)
        {
            try
            {
                var report = await _aiService.GenerateCaseReportAsync(requestId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating report: {ex.Message}");
            }
        }
    }
}
