using System.ComponentModel.DataAnnotations;

namespace B2B_V2.Application.DTOs
{
    public class CandidateDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string NationalID { get; set; } = string.Empty;
        public string IdentificationType { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string BranchLocation { get; set; } = string.Empty;
        public string? Department { get; set; }
        public Guid CompanyId { get; set; }
        public List<CandidateAttachmentDto> Attachments { get; set; } = new List<CandidateAttachmentDto>();
    }

    public class CandidateCreateDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string NationalID { get; set; } = string.Empty;

        [Required]
        public string IdentificationType { get; set; } = string.Empty;

        [Required]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public string Position { get; set; } = string.Empty;

        [Required]
        public string BranchLocation { get; set; } = string.Empty;

        public string? Department { get; set; }
    }

    public class CandidateUpdateDto
    {
        public string? FullName { get; set; }
        public string? NationalID { get; set; }
        public string? IdentificationType { get; set; }
        public string? MobileNumber { get; set; }
        public string? Gender { get; set; }
        public string? Position { get; set; }
        public string? BranchLocation { get; set; }
        public string? Department { get; set; }
    }
}
