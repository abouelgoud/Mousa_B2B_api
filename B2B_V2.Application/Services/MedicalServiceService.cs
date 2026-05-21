using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class MedicalServiceService : IServiceService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MedicalServiceService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllServicesAsync()
        {
            var services = await _unitOfWork.Repository<Service>().GetAllAsync();
            return services.Select(MapToDto);
        }

        public async Task<ServiceDto?> GetServiceByIdAsync(System.Guid id)
        {
            var service = await _unitOfWork.Repository<Service>().GetByIdAsync(id);
            return service == null ? null : MapToDto(service);
        }

        public async Task<ServiceDto> CreateServiceAsync(ServiceDto serviceDto)
        {
            var service = new Service
            {
                Name = serviceDto.Name,
                Code = serviceDto.Code,
                Description = serviceDto.Description,
                Price = serviceDto.Price
            };

            await _unitOfWork.Repository<Service>().AddAsync(service);
            await _unitOfWork.CompleteAsync();

            return MapToDto(service);
        }

        public async Task UpdateServiceAsync(System.Guid id, ServiceDto serviceDto)
        {
            var service = await _unitOfWork.Repository<Service>().GetByIdAsync(id);
            if (service == null) return;

            service.Name = serviceDto.Name;
            service.Code = serviceDto.Code;
            service.Description = serviceDto.Description;
            service.Price = serviceDto.Price;

            _unitOfWork.Repository<Service>().Update(service);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteServiceAsync(System.Guid id)
        {
            var service = await _unitOfWork.Repository<Service>().GetByIdAsync(id);
            if (service == null) return;

            _unitOfWork.Repository<Service>().Remove(service);
            await _unitOfWork.CompleteAsync();
        }

        private ServiceDto MapToDto(Service s)
        {
            return new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Description = s.Description ?? string.Empty,
                Price = s.Price
            };
        }
    }
}
