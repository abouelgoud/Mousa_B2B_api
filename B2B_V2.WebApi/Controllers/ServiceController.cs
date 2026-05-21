using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using B2B_V2.WebApi.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/medical-services")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        [HasPermission("Services.View")]
        public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
        {
            var services = await _serviceService.GetAllServicesAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        [HasPermission("Services.View")]
        public async Task<ActionResult<ServiceDto>> GetService(System.Guid id)
        {
            var service = await _serviceService.GetServiceByIdAsync(id);
            if (service == null) return NotFound();
            return Ok(service);
        }

        [HttpPost]
        [HasPermission("Services.Manage")]
        public async Task<ActionResult<ServiceDto>> CreateService(ServiceDto serviceDto)
        {
            var createdService = await _serviceService.CreateServiceAsync(serviceDto);
            return CreatedAtAction(nameof(GetService), new { id = createdService.Id }, createdService);
        }

        [HttpPut("{id}")]
        [HasPermission("Services.Manage")]
        public async Task<IActionResult> UpdateService(System.Guid id, ServiceDto serviceDto)
        {
            await _serviceService.UpdateServiceAsync(id, serviceDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [HasPermission("Services.Manage")]
        public async Task<IActionResult> DeleteService(System.Guid id)
        {
            await _serviceService.DeleteServiceAsync(id);
            return NoContent();
        }
    } // End of ServiceController
}
