using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
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
    public class ProviderController : ControllerBase
    {
        private readonly IProviderService _providerService;
        private readonly IUnitOfWork _unitOfWork;

        public ProviderController(IProviderService providerService, IUnitOfWork unitOfWork)
        {
            _providerService = providerService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProviderDto>>> GetProviders()
        {
            var providers = await _providerService.GetAllProvidersAsync();
            return Ok(providers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProviderDto>> GetProvider(Guid id)
        {
            var provider = await _providerService.GetProviderByIdAsync(id);
            if (provider == null) return NotFound();
            return Ok(provider);
        }

        [HttpPost]
        public async Task<ActionResult<ProviderDto>> RegisterProvider([FromForm] ProviderRegistrationCreateDto providerDto)
        {
            var result = await _providerService.RegisterProviderAsync(providerDto);
            return CreatedAtAction(nameof(GetProvider), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProvider(Guid id, [FromBody] ProviderDto providerDto)
        {
            var success = await _providerService.UpdateProviderAsync(id, providerDto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] bool isActive)
        {
            var success = await _providerService.ToggleProviderStatusAsync(id, isActive);
            if (!success) return NotFound();
            return NoContent();
        }
        [HttpGet("by-location/{companyId}")]
        public async Task<ActionResult<IEnumerable<ProviderDto>>> GetByLocation(Guid companyId)
        {
            var providers = await _providerService.GetProvidersByLocationAsync(companyId);
            return Ok(providers);
        }

        [HttpPost("{id}/branches")]
        public async Task<ActionResult<ProviderBranchDto>> RegisterBranch(Guid id, [FromBody] CreateProviderBranchDto branchDto)
        {
            var result = await _providerService.AddBranchAsync(id, branchDto);
            return Ok(result);
        }

        [HttpPut("{id}/branches/{branchId}")]
        public async Task<IActionResult> UpdateBranch(Guid id, Guid branchId, [FromBody] CreateProviderBranchDto branchDto)
        {
            var branch = await _unitOfWork.Repository<ProviderBranch>().GetByIdAsync(branchId);
            if (branch == null || branch.ProviderId != id) return NotFound();

            branch.Address = branchDto.Address;
            branch.ContactPersonName = branchDto.ContactPersonName;
            branch.ContactPersonPhone = branchDto.ContactPersonPhone;
            branch.Capacity = branchDto.Capacity;
            branch.Latitude = branchDto.Latitude;
            branch.Longitude = branchDto.Longitude;

            _unitOfWork.Repository<ProviderBranch>().Update(branch);
            await _unitOfWork.CompleteAsync();

            return Ok(new ProviderBranchDto
            {
                Id = branch.Id,
                Address = branch.Address,
                ContactPersonName = branch.ContactPersonName,
                ContactPersonPhone = branch.ContactPersonPhone,
                Capacity = branch.Capacity,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude
            });
        }

        [HttpPost("{id}/verify-audit")]
        public async Task<IActionResult> VerifyAudit(Guid id, [FromBody] ComplianceAuditResultDto auditResult)
        {
            var success = await _providerService.VerifyComplianceAuditAsync(id, auditResult);
            if (!success) return NotFound();
            return Ok(new { message = "Audit result verified and saved.", verified = auditResult.IsVerified });
        }
    }
}
