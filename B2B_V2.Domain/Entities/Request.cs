using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Domain.Entities
{
    public class Request : BaseEntity
    {
        public string CaseID { get; set; } = string.Empty; // Unique, generated
        public Guid CompanyId { get; set; }
        public Company? Company { get; set; }
        public Guid? CandidateId { get; set; }
        public Candidate? Candidate { get; set; }
        public Guid? ScreeningBatchId { get; set; } // To group multi-candidate requests
        public Guid PackageId { get; set; }
        public Package? Package { get; set; }
        public Guid? AssignedProviderId { get; set; }
        public Provider? AssignedProvider { get; set; }
        public Guid? RequestedProviderId { get; set; }
        public Provider? RequestedProvider { get; set; }
        public Guid? BranchId { get; set; }
        public ProviderBranch? Branch { get; set; }
        public string? SupportingDocumentPath { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public DateTime? ExpectedVisitDate { get; set; }
        public bool IsBroadcasted { get; set; } = false;
        
        // Workflow Timestamps
        public DateTime? ArrivedAt { get; set; }
        public DateTime? ExamStartedAt { get; set; }
        public DateTime? SamplesCollectedAt { get; set; }

        public MedicalResult? MedicalResult { get; set; }
        public ICollection<RequestDocument> Documents { get; set; } = new List<RequestDocument>();
        public ICollection<RequestStatusLog> StatusLogs { get; set; } = new List<RequestStatusLog>();
        public ICollection<RequestAdditionalService> AdditionalServices { get; set; } = new List<RequestAdditionalService>();
    }
}
