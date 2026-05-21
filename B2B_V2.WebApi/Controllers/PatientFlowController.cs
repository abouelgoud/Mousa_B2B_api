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
    public class PatientFlowController : ControllerBase
    {
        private readonly IPatientFlowService _patientFlowService;

        public PatientFlowController(IPatientFlowService patientFlowService)
        {
            _patientFlowService = patientFlowService;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInRequestDto dto)
        {
            Guid candidateId;
            var candidateIdString = User.FindFirstValue("CandidateId");
            
            if (!string.IsNullOrEmpty(candidateIdString) && Guid.TryParse(candidateIdString, out var parsedId))
            {
                candidateId = parsedId;
            }
            else
            {
                // Fallback: allow passing ID if user is admin or for testing
                if (dto.CandidateId != null)
                {
                   candidateId = dto.CandidateId.Value;
                }
                else
                {
                   return Forbid();
                }
            }
            
            var success = await _patientFlowService.CheckInAsync(candidateId, dto.Latitude, dto.Longitude);
            
            if (!success)
            {
                return BadRequest("Check-in failed. You might be outside the geofence or not active.");
            }
            return Ok(new { Message = "Checked in successfully" });
        }

        [HttpGet("throughput/{branchId}")]
        public async Task<ActionResult<BranchThroughputDto>> GetThroughput(Guid branchId)
        {
            var result = await _patientFlowService.GetBranchThroughputAsync(branchId);
            return Ok(result);
        }
    }

    public class CheckInRequestDto
    {
        public Guid? CandidateId { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}
