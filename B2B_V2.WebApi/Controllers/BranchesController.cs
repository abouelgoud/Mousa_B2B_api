using B2B_V2.Application.DTOs;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize(Roles = "SuperAdministrator, Administrator")]
    [ApiController]
    [Route("api/[controller]")]
    public class BranchesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public BranchesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BranchDto>>> GetAll()
        {
            var branches = await _unitOfWork.Repository<ProviderBranch>().GetAllAsync(b => b.Provider!);
            return Ok(branches.Select(b => new BranchDto
            {
                Id = b.Id,
                ProviderId = b.ProviderId,
                ProviderName = b.Provider?.LegalName ?? "Unknown",
                Address = b.Address,
                ContactPersonName = b.ContactPersonName,
                ContactPersonPhone = b.ContactPersonPhone,
                Capacity = b.Capacity
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BranchDto>> GetById(Guid id)
        {
            var branch = await _unitOfWork.Repository<ProviderBranch>().GetByIdAsync(id, b => b.Provider!);
            if (branch == null) return NotFound();

            return Ok(new BranchDto
            {
                Id = branch.Id,
                ProviderId = branch.ProviderId,
                ProviderName = branch.Provider?.LegalName ?? "Unknown",
                Address = branch.Address,
                ContactPersonName = branch.ContactPersonName,
                ContactPersonPhone = branch.ContactPersonPhone,
                Capacity = branch.Capacity
            });
        }
    }
}
