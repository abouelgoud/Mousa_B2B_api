using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System.Collections.Generic;

namespace B2B_V2.Domain.Entities
{
    public class Company : BaseEntity
    {
        public string LegalName { get; set; } = string.Empty;
        public string CRNumber { get; set; } = string.Empty;
        public string CRCertificatePath { get; set; } = string.Empty;
        public string HeadOfficeAddress { get; set; } = string.Empty;
        public string? BranchLocations { get; set; } // JSON
        public int CompanySize { get; set; }
        public int TotalEmployees { get; set; }
        public string BusinessActivity { get; set; } = string.Empty;
        public int EstimatedMonthlyScreeningVolume { get; set; }
        public string? VATRegistrationNumber { get; set; }
        public Guid DesignatedContactPersonId { get; set; }
        public ProviderAssignmentMode DefaultProviderAssignmentMode { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public string? MappedProviderIds { get; set; } // Comma separated GUIDs or JSON
        public string? MappedPackageIds { get; set; } // Comma separated GUIDs or JSON
        public string? MappedBranchIds { get; set; } // Comma separated GUIDs or JSON

        public string ContactName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string ContactMobile { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
    }
}
