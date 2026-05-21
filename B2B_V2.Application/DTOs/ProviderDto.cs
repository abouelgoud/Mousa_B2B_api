using B2B_V2.Domain.Enums;
using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class ProviderDto
    {
        public Guid Id { get; set; }
        public string LegalName { get; set; } = string.Empty;
        public string CRCertificatePath { get; set; } = string.Empty;
        public string MOHLicensePath { get; set; } = string.Empty;
        public string? CBAHIAccreditationPath { get; set; }
        public string? LabAccreditationPath { get; set; }
        public string? BranchLocations { get; set; }
        public Guid PrimaryContactPersonId { get; set; }
        public int EstimatedDailyOperationalCapacity { get; set; }
        public LabSetup LabSetup { get; set; }
        public int TierId { get; set; }
        public Guid BankAccountId { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ComplianceAuditJson { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastVerificationDate { get; set; }
        public double? Distance { get; set; } // KM
        public double Rating { get; set; } = 4.5; // Mock rating for now

        public string? ContactName { get; set; }
        public string? ContactNumber { get; set; }
        public string? ContactMobile { get; set; }
        public string? ContactEmail { get; set; }
        
        public List<ProviderBranchDto> Branches { get; set; } = new();
    }

    public class ProviderBranchDto
    {
        public Guid Id { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ContactPersonName { get; set; } = string.Empty;
        public string ContactPersonPhone { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class CreateProviderBranchDto
    {
        public string Address { get; set; } = string.Empty;
        public string ContactPersonName { get; set; } = string.Empty;
        public string ContactPersonPhone { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
