using B2B_V2.Application.DTOs;
using System.Text.Json;
using System.IO;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class ProviderAppService : IProviderService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProviderAppService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ProviderDto>> GetAllProvidersAsync()
        {
            var providers = await _unitOfWork.Repository<Provider>().GetAllAsync(p => p.Branches);
            return providers.Select(p => MapToDto(p));
        }

        public async Task<ProviderDto?> GetProviderByIdAsync(Guid id)
        {
            var provider = await _unitOfWork.Repository<Provider>().GetByIdAsync(id, p => p.Branches);
            return provider != null ? MapToDto(provider) : null;
        }

        public async Task<ProviderDto> RegisterProviderAsync(ProviderRegistrationCreateDto dto)
        {
            var providerId = Guid.NewGuid();
            var uploadDir = Path.Combine("wwwroot", "uploads", "providers", providerId.ToString());
            
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            string crPath = await SaveFileAsync(dto.CRCertificateFile, uploadDir);
            string mohPath = await SaveFileAsync(dto.MOHLicenseFile, uploadDir);
            string? cbahiPath = dto.CBAHIAccreditationFile != null ? await SaveFileAsync(dto.CBAHIAccreditationFile, uploadDir) : null;
            string? labPath = dto.LabAccreditationFile != null ? await SaveFileAsync(dto.LabAccreditationFile, uploadDir) : null;

            var provider = new Provider
            {
                Id = providerId,
                LegalName = dto.LegalName,
                CRCertificatePath = crPath,
                MOHLicensePath = mohPath,
                CBAHIAccreditationPath = cbahiPath,
                LabAccreditationPath = labPath,
                BranchLocations = dto.BranchLocations,
                PrimaryContactPersonId = dto.PrimaryContactPersonId,
                EstimatedDailyOperationalCapacity = dto.EstimatedDailyOperationalCapacity,
                LabSetup = dto.LabSetup,
                TierId = dto.TierId,
                BankAccountId = dto.BankAccountId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            await _unitOfWork.Repository<Provider>().AddAsync(provider);
            await _unitOfWork.CompleteAsync();

            return MapToDto(provider);
        }

        private async Task<string> SaveFileAsync(Microsoft.AspNetCore.Http.IFormFile file, string directory)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(directory, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            // Return relative path for DB
            return filePath.Replace("wwwroot\\", "").Replace("wwwroot/", "").Replace("\\", "/");
        }

        public async Task<bool> UpdateProviderAsync(Guid id, ProviderDto dto)
        {
            var provider = await _unitOfWork.Repository<Provider>().GetByIdAsync(id);
            if (provider == null) return false;

            provider.LegalName = dto.LegalName;
            provider.CRCertificatePath = dto.CRCertificatePath;
            provider.MOHLicensePath = dto.MOHLicensePath;
            provider.CBAHIAccreditationPath = dto.CBAHIAccreditationPath;
            provider.LabAccreditationPath = dto.LabAccreditationPath;
            provider.BranchLocations = dto.BranchLocations;
            provider.PrimaryContactPersonId = dto.PrimaryContactPersonId;
            provider.EstimatedDailyOperationalCapacity = dto.EstimatedDailyOperationalCapacity;
            provider.LabSetup = dto.LabSetup;
            provider.TierId = dto.TierId;
            provider.BankAccountId = dto.BankAccountId;
            provider.Latitude = dto.Latitude;
            provider.Longitude = dto.Longitude;

            _unitOfWork.Repository<Provider>().Update(provider);
            return await _unitOfWork.CompleteAsync() > 0;
        }

        public async Task<IEnumerable<ProviderDto>> GetProvidersByLocationAsync(Guid companyId)
        {
            var company = await _unitOfWork.Repository<Company>().GetByIdAsync(companyId);
            var providers = await _unitOfWork.Repository<Provider>().GetAllAsync(p => p.Branches);

            var providerDtos = providers.Select(p => MapToDto(p)).ToList();

            if (company != null && company.Latitude.HasValue && company.Longitude.HasValue)
            {
                foreach (var dto in providerDtos)
                {
                    if (dto.Latitude.HasValue && dto.Longitude.HasValue)
                    {
                        dto.Distance = CalculateDistance(
                            (double)company.Latitude.Value, (double)company.Longitude.Value,
                            (double)dto.Latitude.Value, (double)dto.Longitude.Value);
                    }
                }
            }

            return providerDtos;
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Earth's radius in KM
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);

        public async Task<bool> ToggleProviderStatusAsync(Guid id, bool isActive)
        {
            var provider = await _unitOfWork.Repository<Provider>().GetByIdAsync(id);
            if (provider == null) return false;

            provider.IsActive = isActive;
            _unitOfWork.Repository<Provider>().Update(provider);
            return await _unitOfWork.CompleteAsync() > 0;
        }

        public async Task<ProviderBranchDto> AddBranchAsync(Guid providerId, CreateProviderBranchDto dto)
        {
            var provider = await _unitOfWork.Repository<Provider>().GetByIdAsync(providerId);
            if (provider == null) throw new Exception("Provider not found");

            var branch = new ProviderBranch
            {
                ProviderId = providerId,
                Address = dto.Address,
                ContactPersonName = dto.ContactPersonName,
                ContactPersonPhone = dto.ContactPersonPhone,
                Capacity = dto.Capacity,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            await _unitOfWork.Repository<ProviderBranch>().AddAsync(branch);
            await _unitOfWork.CompleteAsync();

            return new ProviderBranchDto
            {
                Id = branch.Id,
                Address = branch.Address,
                ContactPersonName = branch.ContactPersonName,
                ContactPersonPhone = branch.ContactPersonPhone,
                Capacity = branch.Capacity,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude
            };
        }

        public async Task<bool> VerifyComplianceAuditAsync(Guid providerId, ComplianceAuditResultDto auditResult)
        {
            var provider = await _unitOfWork.Repository<Provider>().GetByIdAsync(providerId);
            if (provider == null) return false;

            provider.ComplianceAuditJson = JsonSerializer.Serialize(auditResult);
            provider.IsVerified = auditResult.IsVerified;
            provider.LastVerificationDate = DateTime.UtcNow;

            _unitOfWork.Repository<Provider>().Update(provider);
            return await _unitOfWork.CompleteAsync() > 0;
        }

        private ProviderDto MapToDto(Provider p)
        {
            return new ProviderDto
            {
                Id = p.Id,
                LegalName = p.LegalName,
                CRCertificatePath = p.CRCertificatePath,
                MOHLicensePath = p.MOHLicensePath,
                CBAHIAccreditationPath = p.CBAHIAccreditationPath,
                LabAccreditationPath = p.LabAccreditationPath,
                BranchLocations = p.BranchLocations,
                PrimaryContactPersonId = p.PrimaryContactPersonId,
                EstimatedDailyOperationalCapacity = p.EstimatedDailyOperationalCapacity,
                LabSetup = p.LabSetup,
                TierId = p.TierId,
                BankAccountId = p.BankAccountId,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                ComplianceAuditJson = p.ComplianceAuditJson,
                IsVerified = p.IsVerified,
                IsActive = p.IsActive,
                LastVerificationDate = p.LastVerificationDate,
                Distance = null, // Set by caller if location context is available
                Rating = 4.5, // Mock for now
                Branches = p.Branches?.Select(b => new ProviderBranchDto
                {
                    Id = b.Id,
                    Address = b.Address,
                    ContactPersonName = b.ContactPersonName,
                    ContactPersonPhone = b.ContactPersonPhone,
                    Capacity = b.Capacity,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude
                }).ToList() ?? new List<ProviderBranchDto>()
            };
        }
    }
}
