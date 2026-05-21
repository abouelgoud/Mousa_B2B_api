using B2B_V2.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface ICandidateService
    {
        Task<IEnumerable<CandidateDto>> GetCandidatesByCompanyIdAsync(Guid companyId);
        Task<CandidateDto> GetCandidateByIdAsync(Guid id);
        Task<CandidateDto> CreateCandidateAsync(Guid companyId, CandidateCreateDto dto, IEnumerable<FileUploadRequest>? attachments = null);
        Task UpdateCandidateAsync(Guid id, CandidateUpdateDto dto, IEnumerable<FileUploadRequest>? attachments = null);
        Task DeleteCandidateAsync(Guid id);
        Task<byte[]> GetTemplateAsync();
        Task UploadCandidatesAsync(Guid companyId, Stream excelStream);
    }
}
