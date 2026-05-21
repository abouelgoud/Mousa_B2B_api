using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Application.DTOs
{
    public class RequestDto
    {
        public Guid Id { get; set; }
        public string CaseID { get; set; } = string.Empty;
        public Guid CompanyId { get; set; }
        public Guid? CandidateId { get; set; }
        public string CandidateFullName { get; set; } = string.Empty;
        public string NationalID { get; set; } = string.Empty;
        public Guid PackageId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public Guid? AssignedProviderId { get; set; }
        public string? AssignedProviderName { get; set; }
        public Guid? RequestedProviderId { get; set; }
        public string? RequestedProviderName { get; set; }
        public Guid? BranchId { get; set; }
        public string? BranchName { get; set; }
        public string? SupportingDocumentPath { get; set; }
        public RequestStatus Status { get; set; }
        public bool IsBroadcasted { get; set; }
        public DateTime? ExpectedVisitDate { get; set; }
        public Guid? ScreeningBatchId { get; set; }
        public List<RequestDocumentDto> Documents { get; set; } = new();

        public DateTime? ArrivedAt { get; set; }
        public DateTime? ExamStartedAt { get; set; }
        public List<RequestStatusLogDto> StatusLogs { get; set; } = new();
        public List<RequestAdditionalServiceDto> AdditionalServices { get; set; } = new();
        public List<ServiceDto> PackageServices { get; set; } = new();
    }

    public class RequestStatusLogDto
    {
        public Guid Id { get; set; }
        public RequestStatus Status { get; set; }
        public string? Comment { get; set; }
        public string? ChangedByName { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class RequestAdditionalServiceDto
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class CreateRequestDto
    {
        public List<Guid> CandidateIds { get; set; } = new();
        public Guid PackageId { get; set; }
        public Guid? RequestedProviderId { get; set; }
        public Guid? BranchId { get; set; }
        public string? SupportingDocumentPath { get; set; }
        public DateTime? ExpectedVisitDate { get; set; }
    }
}
