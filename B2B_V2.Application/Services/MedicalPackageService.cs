using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class MedicalPackageService : IPackageService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MedicalPackageService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PackageDto>> GetAllPackagesAsync()
        {
            var packages = await _unitOfWork.Repository<Package>()
                .GetAllAsync(p => p.PackageServices);
                
            var dtos = new List<PackageDto>();
            foreach(var p in packages)
            {
                dtos.Add(await MapToDtoAsync(p));
            }
            return dtos;
        }

        public async Task<PackageDto?> GetPackageByIdAsync(Guid id)
        {
            var package = await _unitOfWork.Repository<Package>()
                .GetByIdAsync(id, p => p.PackageServices);

            return package == null ? null : await MapToDtoAsync(package);
        }

        public async Task<PackageDto> CreatePackageAsync(PackageCreateDto packageDto)
        {
            var package = new Package
            {
                Name = packageDto.Name,
                Description = packageDto.Description,
                Price = packageDto.Price
            };

            await _unitOfWork.Repository<Package>().AddAsync(package);
            await _unitOfWork.CompleteAsync();

            if (packageDto.ServiceIds.Any())
            {
                foreach (var serviceId in packageDto.ServiceIds)
                {
                    await _unitOfWork.Repository<B2B_V2.Domain.Entities.PackageService>().AddAsync(new B2B_V2.Domain.Entities.PackageService
                    {
                        PackageId = package.Id,
                        ServiceId = serviceId
                    });
                }
                await _unitOfWork.CompleteAsync();
            }

            return (await GetPackageByIdAsync(package.Id))!;
        }

        public async Task UpdatePackageAsync(Guid id, PackageCreateDto packageDto)
        {
            var package = await _unitOfWork.Repository<Package>().GetByIdAsync(id, p => p.PackageServices);
            if (package == null) throw new KeyNotFoundException("Package not found");

            package.Name = packageDto.Name;
            package.Description = packageDto.Description;
            package.Price = packageDto.Price;

            // Update services (simple clear and add)
            foreach(var ps in package.PackageServices.ToList())
            {
                 _unitOfWork.Repository<B2B_V2.Domain.Entities.PackageService>().Remove(ps);
            }
            
            foreach (var serviceId in packageDto.ServiceIds)
            {
                await _unitOfWork.Repository<B2B_V2.Domain.Entities.PackageService>().AddAsync(new B2B_V2.Domain.Entities.PackageService
                {
                    PackageId = id,
                    ServiceId = serviceId
                });
            }

            _unitOfWork.Repository<Package>().Update(package);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeletePackageAsync(Guid id)
        {
            var package = await _unitOfWork.Repository<Package>().GetByIdAsync(id);
            if (package != null)
            {
                _unitOfWork.Repository<Package>().Remove(package);
                await _unitOfWork.CompleteAsync();
            }
        }

        private async Task<PackageDto> MapToDtoAsync(Package package)
        {
            var dto = new PackageDto
            {
                Id = package.Id,
                Name = package.Name,
                Description = package.Description ?? string.Empty,
                Price = package.Price,
                Services = new List<ServiceDto>()
            };

            if (package.PackageServices != null && package.PackageServices.Any())
            {
                foreach (var ps in package.PackageServices)
                {
                    var service = await _unitOfWork.Repository<Service>().GetByIdAsync(ps.ServiceId);
                    if (service != null)
                    {
                        dto.Services.Add(new ServiceDto
                        {
                            Id = service.Id,
                            Name = service.Name,
                            Code = service.Code,
                            Description = service.Description,
                            Price = service.Price
                        });
                    }
                }
            }
            return dto;
        }
    }
}
