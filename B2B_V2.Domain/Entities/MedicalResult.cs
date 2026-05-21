using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class MedicalResult : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        
        public string VitalSigns { get; set; } = string.Empty;
        public string LabFindings { get; set; } = string.Empty;
        public string PhysicianNotes { get; set; } = string.Empty;
        public bool IsFitForWork { get; set; }
        public string? ResultDocumentPath { get; set; }
        
        public bool Approved { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedBy { get; set; }
        public string? ReviewComments { get; set; }
    }
}
