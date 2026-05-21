using B2B_V2.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace B2B_V2.Domain.Entities
{
    public class Candidate : BaseEntity
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

        public Guid CompanyId { get; set; }
        public Company? Company { get; set; }

        public ICollection<CandidateAttachment> Attachments { get; set; } = new List<CandidateAttachment>();
    }
}
