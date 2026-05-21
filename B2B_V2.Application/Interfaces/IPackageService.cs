using B2B_V2.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IPackageService
    {
        Task<IEnumerable<PackageDto>> GetAllPackagesAsync();
        Task<PackageDto?> GetPackageByIdAsync(Guid id);
        Task<PackageDto> CreatePackageAsync(PackageCreateDto packageDto);
        Task UpdatePackageAsync(Guid id, PackageCreateDto packageDto);
        Task DeletePackageAsync(Guid id);
    }
}
