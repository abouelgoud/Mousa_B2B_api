using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System.Collections.Generic;

namespace B2B_V2.Domain.Entities
{
    public class Provider : BaseEntity
    {
        public string LegalName { get; set; } = string.Empty;
        public string CRCertificatePath { get; set; } = string.Empty;
        public string MOHLicensePath { get; set; } = string.Empty;
        public string? CBAHIAccreditationPath { get; set; }
        public string? LabAccreditationPath { get; set; }
        public string? BranchLocations { get; set; } // JSON
        public Guid PrimaryContactPersonId { get; set; }
        public int EstimatedDailyOperationalCapacity { get; set; }
        public LabSetup LabSetup { get; set; }
        public int TierId { get; set; }
        public ProviderTier? Tier { get; set; }
        public string? OccupationalPhysicianLicensePath { get; set; }
        public string? MedicalWasteManagementContractPath { get; set; }
        public string? ProfessionalLiabilityInsurancePath { get; set; }
        public Guid BankAccountId { get; set; }
        public BankAccount? BankAccount { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public string? ComplianceAuditJson { get; set; }
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastVerificationDate { get; set; }

        public string ContactName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string ContactMobile { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;

        public ICollection<ProviderBranch> Branches { get; set; } = new List<ProviderBranch>();
    }
}
