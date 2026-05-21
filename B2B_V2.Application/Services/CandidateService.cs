using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using ClosedXML.Excel;
using Mapster;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly IGenericRepository<Candidate> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CandidateService(IGenericRepository<Candidate> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<CandidateDto>> GetCandidatesByCompanyIdAsync(Guid companyId)
        {
            var candidates = await _repository.FindAsync(c => c.CompanyId == companyId, c => c.Attachments);
            return candidates.Adapt<IEnumerable<CandidateDto>>();
        }

        public async Task<CandidateDto> GetCandidateByIdAsync(Guid id)
        {
            var candidate = await _repository.GetByIdAsync(id, c => c.Attachments);
            if (candidate == null) throw new KeyNotFoundException("Candidate not found.");
            return candidate.Adapt<CandidateDto>();
        }

        public async Task<CandidateDto> CreateCandidateAsync(Guid companyId, CandidateCreateDto dto, IEnumerable<FileUploadRequest>? attachments = null)
        {
            Console.WriteLine($"[DEBUG] CreateCandidateAsync: ID Type: {dto.IdentificationType}, National ID: {dto.NationalID}");
            var candidate = dto.Adapt<Candidate>();
            candidate.CompanyId = companyId;
            Console.WriteLine($"[DEBUG] Candidate Adapted: ID Type: {candidate.IdentificationType}");

            if (attachments != null)
            {
                foreach (var file in attachments)
                {
                    await SaveAttachmentAsync(candidate, file);
                }
            }

            await _repository.AddAsync(candidate);
            await _unitOfWork.CompleteAsync();

            return candidate.Adapt<CandidateDto>();
        }

        public async Task UpdateCandidateAsync(Guid id, CandidateUpdateDto dto, IEnumerable<FileUploadRequest>? attachments = null)
        {
            var candidate = await _repository.GetByIdAsync(id, c => c.Attachments);
            if (candidate == null) throw new KeyNotFoundException("Candidate not found.");

            Console.WriteLine($"[DEBUG] Candidate retrieved. ID: {candidate.Id}, Current ID Type: {candidate.IdentificationType}");
            Console.WriteLine($"[DEBUG] Update DTO ID Type: {dto.IdentificationType}");

            var config = new TypeAdapterConfig();
            config.NewConfig<CandidateUpdateDto, Candidate>()
                  .IgnoreNullValues(true);

            dto.Adapt(candidate, config);
            Console.WriteLine($"[DEBUG] After Adapt. ID: {candidate.Id}, New ID Type: {candidate.IdentificationType}");

            if (attachments != null)
            {
                foreach (var file in attachments)
                {
                    await SaveAttachmentAsync(candidate, file);
                }
            }

            Console.WriteLine($"[DEBUG] Before Save.");
            // _repository.Update(candidate); // Removed as entity is tracked
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteCandidateAsync(Guid id)
        {
            var candidate = await _repository.GetByIdAsync(id);
            if (candidate == null) throw new KeyNotFoundException("Candidate not found.");

            _repository.Remove(candidate);
            await _unitOfWork.CompleteAsync();
        }

        private async Task SaveAttachmentAsync(Candidate candidate, FileUploadRequest file)
        {
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "candidates");
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.Content.CopyToAsync(stream);
            }

            candidate.Attachments.Add(new CandidateAttachment
            {
                Id = Guid.Empty, // Force EF to treat as new (Insert) instead of Update
                FileName = file.FileName,
                FilePath = $"/uploads/candidates/{fileName}",
                ContentType = file.ContentType,
                FileSize = file.Length
            });
        }

        public async Task<byte[]> GetTemplateAsync()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Candidates");
                worksheet.Cell(1, 1).Value = "Full Name";
                worksheet.Cell(1, 2).Value = "National ID";
                worksheet.Cell(1, 3).Value = "Identification Type";
                worksheet.Cell(1, 4).Value = "Mobile Number";
                worksheet.Cell(1, 5).Value = "Gender";
                worksheet.Cell(1, 6).Value = "Position";
                worksheet.Cell(1, 7).Value = "Branch Location";
                worksheet.Cell(1, 8).Value = "Department";

                // Add some styling to headers
                var headerRange = worksheet.Range(1, 1, 1, 8);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        public async Task UploadCandidatesAsync(Guid companyId, Stream excelStream)
        {
            using (var workbook = new XLWorkbook(excelStream))
            {
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RowsUsed();

                foreach (var row in rows.Skip(1)) // Skip header
                {
                    var fullName = row.Cell(1).Value.ToString();
                    var nationalID = row.Cell(2).Value.ToString();
                    var identificationType = row.Cell(3).Value.ToString();
                    var mobileNumber = row.Cell(4).Value.ToString();
                    var gender = row.Cell(5).Value.ToString();
                    var position = row.Cell(6).Value.ToString();
                    var branchLocation = row.Cell(7).Value.ToString();
                    var department = row.Cell(8).Value.ToString();

                    if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(nationalID))
                        continue;

                    var candidate = new Candidate
                    {
                        FullName = fullName,
                        NationalID = nationalID,
                        IdentificationType = identificationType,
                        MobileNumber = mobileNumber,
                        Gender = gender,
                        Position = position,
                        BranchLocation = branchLocation,
                        Department = department,
                        CompanyId = companyId
                    };

                    await _repository.AddAsync(candidate);
                }

                await _unitOfWork.CompleteAsync();
            }
        }
    }
}
