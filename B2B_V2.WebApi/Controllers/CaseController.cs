using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CaseController : ControllerBase
    {
        private readonly ICaseService _caseService;

        public CaseController(ICaseService caseService)
        {
            _caseService = caseService;
        }

        [HttpPost("submit-results")]
        public async Task<IActionResult> SubmitResults([FromBody] MedicalResultDto results)
        {
            var success = await _caseService.SubmitMedicalResultsAsync(results);
            if (!success) return BadRequest("Failed to submit medical results.");
            return Ok();
        }

        [HttpPost("review")]
        public async Task<IActionResult> ReviewCase([FromBody] CaseReviewDto review)
        {
            // Inject admin name from context if possible
            review.AdminName = User.Identity?.Name;
            var success = await _caseService.ReviewCaseAsync(review);
            if (!success) return BadRequest("Failed to process case review.");
            return Ok();
        }

        [HttpGet("provider-worklist/{providerId}")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetProviderWorklist(Guid providerId)
        {
            var worklist = await _caseService.GetProviderWorklistAsync(providerId);
            return Ok(worklist);
        }

        [HttpGet("waiting-queue")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetGlobalWaitingQueue()
        {
            var queue = await _caseService.GetGlobalWaitingQueueAsync();
            return Ok(queue);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetArchivedCases()
        {
            var archived = await _caseService.GetArchivedCasesAsync();
            return Ok(archived);
        }

        [HttpGet("admin-queue")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetAdminReviewQueue()
        {
            // Extract ProviderId from claims if present (assuming claim name "ProviderId")
            var providerIdClaim = User.Claims.FirstOrDefault(c => c.Type == "ProviderId")?.Value;
            Guid? providerId = providerIdClaim != null ? Guid.Parse(providerIdClaim) : null;

            var queue = await _caseService.GetAdminReviewQueueAsync(providerId);
            return Ok(queue);
        }

        [HttpGet]
        [Route("{id:guid}")]
        public async Task<ActionResult<RequestDto>> GetCaseDetails(Guid id)
        {
            var details = await _caseService.GetCaseDetailsAsync(id);
            if (details == null) return NotFound();
            return Ok(details);
        }
        [HttpPost("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] B2B_V2.Domain.Enums.RequestStatus status)
        {
            var success = await _caseService.UpdateCaseStatusAsync(id, status);
            if (!success) return BadRequest("Failed to update status.");
            return Ok();
        }
    }
}
