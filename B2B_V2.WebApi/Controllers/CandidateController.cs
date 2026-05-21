using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController : ControllerBase
    {
        private readonly ICandidateService _candidateService;

        public CandidateController(ICandidateService candidateService)
        {
            _candidateService = candidateService;
        }

        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<CandidateDto>>> GetByCompanyId(Guid companyId)
        {
            var candidates = await _candidateService.GetCandidatesByCompanyIdAsync(companyId);
            return Ok(candidates);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CandidateDto>> GetById(Guid id)
        {
            var candidate = await _candidateService.GetCandidateByIdAsync(id);
            return Ok(candidate);
        }

        [HttpPost]
        public async Task<ActionResult<CandidateDto>> Create([FromForm] CandidateCreateDto dto, [FromForm] List<IFormFile> attachments)
        {
            var companyIdClaim = User.FindFirstValue("CompanyId");
            if (string.IsNullOrEmpty(companyIdClaim)) return BadRequest("Company ID not found in claims.");
            var companyId = Guid.Parse(companyIdClaim);
            Console.WriteLine($"[CONTROLLER DEBUG] Create: ID Type: {dto.IdentificationType}, National ID: {dto.NationalID}");

            var fileRequests = attachments.Select(f => new FileUploadRequest
            {
                FileName = f.FileName,
                ContentType = f.ContentType,
                Length = f.Length,
                Content = f.OpenReadStream()
            });

            var candidate = await _candidateService.CreateCandidateAsync(companyId, dto, fileRequests);
            return CreatedAtAction(nameof(GetById), new { id = candidate.Id }, candidate);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(Guid id, [FromForm] CandidateUpdateDto dto, [FromForm] List<IFormFile> attachments)
        {
            try
            {
                var fileRequests = attachments?.Select(f => new FileUploadRequest
                {
                    FileName = f.FileName,
                    ContentType = f.ContentType,
                    Length = f.Length,
                    Content = f.OpenReadStream()
                });

                await _candidateService.UpdateCandidateAsync(id, dto, fileRequests);
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating candidate: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            await _candidateService.DeleteCandidateAsync(id);
            return NoContent();
        }

        [HttpGet("template")]
        public async Task<IActionResult> DownloadTemplate()
        {
            var content = await _candidateService.GetTemplateAsync();
            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "CandidateTemplate.xlsx");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var companyIdClaim = User.FindFirstValue("CompanyId");
            if (string.IsNullOrEmpty(companyIdClaim)) return BadRequest("Company ID not found in claims.");
            var companyId = Guid.Parse(companyIdClaim);

            using (var stream = file.OpenReadStream())
            {
                await _candidateService.UploadCandidatesAsync(companyId, stream);
            }

            return Ok(new { message = "Candidates uploaded successfully" });
        }
    }
}
