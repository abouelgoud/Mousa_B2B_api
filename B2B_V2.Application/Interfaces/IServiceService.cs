using B2B_V2.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDto>> GetAllServicesAsync();
        Task<ServiceDto?> GetServiceByIdAsync(System.Guid id);
        Task<ServiceDto> CreateServiceAsync(ServiceDto serviceDto);
        Task UpdateServiceAsync(System.Guid id, ServiceDto serviceDto);
        Task DeleteServiceAsync(System.Guid id);
    }
}
