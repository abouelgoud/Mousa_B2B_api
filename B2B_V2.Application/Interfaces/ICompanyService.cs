using B2B_V2.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyDto>> GetAllCompaniesAsync();
        Task<CompanyDto?> GetCompanyByIdAsync(Guid id);
        Task<CompanyDto> CreateCompanyAsync(CompanyDto companyDto);
        Task<bool> UpdateCompanyAsync(Guid id, CompanyDto companyDto);
        Task<bool> DeleteCompanyAsync(Guid id);
    }
}
