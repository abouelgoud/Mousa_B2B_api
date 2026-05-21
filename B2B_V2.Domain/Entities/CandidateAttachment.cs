using B2B_V2.Domain.Common;
using System;
using System.ComponentModel.DataAnnotations;

namespace B2B_V2.Domain.Entities
{
    public class CandidateAttachment : BaseEntity
    {
        public Guid CandidateId { get; set; }
        public Candidate Candidate { get; set; } = null!;

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }
    }
}
