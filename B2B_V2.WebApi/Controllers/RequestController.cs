using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RequestController : ControllerBase
    {
        private readonly IRequestService _requestService;

        public RequestController(IRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpPost]
        public async Task<ActionResult<IEnumerable<RequestDto>>> CreateRequest([FromBody] CreateRequestDto createRequestDto)
        {
            var companyIdClaim = User.FindFirstValue("CompanyId");
            if (string.IsNullOrEmpty(companyIdClaim)) return BadRequest("Company ID not found in claims.");
            var companyId = Guid.Parse(companyIdClaim);

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;

            var result = await _requestService.CreateRequestBatchAsync(companyId, createRequestDto, userId);
            return Ok(result);
        }

        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetCompanyRequests(Guid companyId)
        {
            var requests = await _requestService.GetCompanyRequestsAsync(companyId);
            return Ok(requests);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RequestDto>> GetRequest(Guid id)
        {
            var request = await _requestService.GetRequestByIdAsync(id);
            if (request == null) return NotFound();
            return Ok(request);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;

            var success = await _requestService.UpdateRequestStatusAsync(id, request.Status, request.Comment, userId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/additional-services")]
        public async Task<IActionResult> AddAdditionalServices(Guid id, [FromBody] List<Guid> serviceIds)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;

            var success = await _requestService.AddAdditionalServicesAsync(id, serviceIds, userId);
            if (!success) return NotFound();
            return Ok();
        }

        public class UpdateStatusRequest
        {
            public B2B_V2.Domain.Enums.RequestStatus Status { get; set; }
            public string? Comment { get; set; }
        }
        [HttpPost("{id}/documents")]
        public async Task<ActionResult<RequestDocumentDto>> UploadDocument(Guid id, IFormFile file)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;

            try
            {
                var document = await _requestService.UploadDocumentAsync(id, file, userId);
                return Ok(document);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Request not found");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("available-broadcasts")]
        public async Task<ActionResult<IEnumerable<RequestDto>>> GetAvailableBroadcasts()
        {
            var providerIdClaim = User.FindFirstValue("ProviderId");
            if (string.IsNullOrEmpty(providerIdClaim)) return Forbid("Only providers can view broadcasts.");
            
            var requests = await _requestService.GetAvailableBroadcastsAsync();
            return Ok(requests);
        }

        [HttpPost("{id}/pull")]
        public async Task<IActionResult> PullRequest(Guid id)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;

            var providerIdClaim = User.FindFirstValue("ProviderId");
            if (string.IsNullOrEmpty(providerIdClaim)) return Forbid("Only providers can pull requests.");
            var providerId = Guid.Parse(providerIdClaim);

            var success = await _requestService.PullRequestAsync(id, providerId, userId);
            if (!success) return BadRequest("Request is no longer available to be pulled or does not exist.");
            
            return Ok();
        }
    }
}
