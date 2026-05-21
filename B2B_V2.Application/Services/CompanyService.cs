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
    public class CompanyService : ICompanyService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CompanyService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync()
        {
            var companies = await _unitOfWork.Repository<Company>().GetAllAsync();
            return companies.Select(c => MapToDto(c));
        }

        public async Task<CompanyDto?> GetCompanyByIdAsync(Guid id)
        {
            var company = await _unitOfWork.Repository<Company>().GetByIdAsync(id);
            return company != null ? MapToDto(company) : null;
        }

        public async Task<CompanyDto> CreateCompanyAsync(CompanyDto companyDto)
        {
            var company = new Company
            {
                LegalName = companyDto.LegalName,
                CRNumber = companyDto.CRNumber,
                CRCertificatePath = companyDto.CRCertificatePath,
                HeadOfficeAddress = companyDto.HeadOfficeAddress,
                BranchLocations = companyDto.BranchLocations,
                CompanySize = companyDto.CompanySize,
                TotalEmployees = companyDto.TotalEmployees,
                BusinessActivity = companyDto.BusinessActivity,
                EstimatedMonthlyScreeningVolume = companyDto.EstimatedMonthlyScreeningVolume,
                VATRegistrationNumber = companyDto.VATRegistrationNumber,
                DesignatedContactPersonId = companyDto.DesignatedContactPersonId,
                DefaultProviderAssignmentMode = companyDto.DefaultProviderAssignmentMode,
                MappedProviderIds = companyDto.MappedProviderIds,
                MappedPackageIds = companyDto.MappedPackageIds,
                MappedBranchIds = companyDto.MappedBranchIds
            };

            await _unitOfWork.Repository<Company>().AddAsync(company);
            await _unitOfWork.CompleteAsync();

            return MapToDto(company);
        }

        public async Task<bool> UpdateCompanyAsync(Guid id, CompanyDto companyDto)
        {
            var company = await _unitOfWork.Repository<Company>().GetByIdAsync(id);
            if (company == null) return false;

            company.LegalName = companyDto.LegalName;
            company.CRNumber = companyDto.CRNumber;
            company.CRCertificatePath = companyDto.CRCertificatePath;
            company.HeadOfficeAddress = companyDto.HeadOfficeAddress;
            company.BranchLocations = companyDto.BranchLocations;
            company.CompanySize = companyDto.CompanySize;
            company.TotalEmployees = companyDto.TotalEmployees;
            company.BusinessActivity = companyDto.BusinessActivity;
            company.EstimatedMonthlyScreeningVolume = companyDto.EstimatedMonthlyScreeningVolume;
            company.VATRegistrationNumber = companyDto.VATRegistrationNumber;
            company.DesignatedContactPersonId = companyDto.DesignatedContactPersonId;
            company.DefaultProviderAssignmentMode = companyDto.DefaultProviderAssignmentMode;
            company.MappedProviderIds = companyDto.MappedProviderIds;
            company.MappedPackageIds = companyDto.MappedPackageIds;
            company.MappedBranchIds = companyDto.MappedBranchIds;

            _unitOfWork.Repository<Company>().Update(company);
            return await _unitOfWork.CompleteAsync() > 0;
        }

        public async Task<bool> DeleteCompanyAsync(Guid id)
        {
            var company = await _unitOfWork.Repository<Company>().GetByIdAsync(id);
            if (company == null) return false;

            _unitOfWork.Repository<Company>().Remove(company);
            return await _unitOfWork.CompleteAsync() > 0;
        }

        private CompanyDto MapToDto(Company company)
        {
            return new CompanyDto
            {
                Id = company.Id,
                LegalName = company.LegalName,
                CRNumber = company.CRNumber,
                CRCertificatePath = company.CRCertificatePath,
                HeadOfficeAddress = company.HeadOfficeAddress,
                BranchLocations = company.BranchLocations,
                CompanySize = company.CompanySize,
                TotalEmployees = company.TotalEmployees,
                BusinessActivity = company.BusinessActivity,
                EstimatedMonthlyScreeningVolume = company.EstimatedMonthlyScreeningVolume,
                VATRegistrationNumber = company.VATRegistrationNumber,
                DesignatedContactPersonId = company.DesignatedContactPersonId,
                DefaultProviderAssignmentMode = company.DefaultProviderAssignmentMode,
                MappedProviderIds = company.MappedProviderIds,
                MappedPackageIds = company.MappedPackageIds,
                MappedBranchIds = company.MappedBranchIds
            };
        }
    }
}
