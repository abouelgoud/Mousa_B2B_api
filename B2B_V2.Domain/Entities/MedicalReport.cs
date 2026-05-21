using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Domain.Entities
{
    public class MedicalReport : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        public ReportType ReportType { get; set; }
        public string FilePath { get; set; } = string.Empty;
        public Guid UploadedByProviderUserId { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public MedicalAssessment? MedicalAssessment { get; set; }
        public ApprovalStatus? ApprovalStatus { get; set; } = Enums.ApprovalStatus.Pending;
        public string? Notes { get; set; }
    }
}
