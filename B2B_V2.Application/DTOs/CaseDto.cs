using System;

namespace B2B_V2.Application.DTOs
{
    public class MedicalResultDto
    {
        public Guid RequestId { get; set; }
        public string VitalSigns { get; set; } = string.Empty;
        public string LabFindings { get; set; } = string.Empty;
        public string PhysicianNotes { get; set; } = string.Empty;
        public bool IsFitForWork { get; set; }
        public string? ResultDocumentPath { get; set; }
    }

    public class CaseReviewDto
    {
        public Guid RequestId { get; set; }
        public bool Approved { get; set; }
        public string? Comments { get; set; }
        public string? AdminName { get; set; }
    }
}
