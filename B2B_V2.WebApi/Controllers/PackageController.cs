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
    public class PackageController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackageController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PackageDto>>> GetPackages()
        {
            var packages = await _packageService.GetAllPackagesAsync();
            return Ok(packages);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PackageDto>> GetPackage(Guid id)
        {
            var package = await _packageService.GetPackageByIdAsync(id);
            if (package == null) return NotFound();
            return Ok(package);
        }

        [HttpPost]
        public async Task<ActionResult<PackageDto>> CreatePackage([FromBody] PackageCreateDto packageDto)
        {
            var createdPackage = await _packageService.CreatePackageAsync(packageDto);
            return CreatedAtAction(nameof(GetPackage), new { id = createdPackage.Id }, createdPackage);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePackage(Guid id, [FromBody] PackageCreateDto packageDto)
        {
            try
            {
                await _packageService.UpdatePackageAsync(id, packageDto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePackage(Guid id)
        {
            await _packageService.DeletePackageAsync(id);
            return NoContent();
        }
    }
}
