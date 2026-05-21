using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Application.DTOs
{
    public class CompanyDto
    {
        public Guid Id { get; set; }
        public string LegalName { get; set; } = string.Empty;
        public string CRNumber { get; set; } = string.Empty;
        public string CRCertificatePath { get; set; } = string.Empty;
        public string HeadOfficeAddress { get; set; } = string.Empty;
        public string? BranchLocations { get; set; }
        public int CompanySize { get; set; }
        public int TotalEmployees { get; set; }
        public string BusinessActivity { get; set; } = string.Empty;
        public int EstimatedMonthlyScreeningVolume { get; set; }
        public string? VATRegistrationNumber { get; set; }
        public Guid DesignatedContactPersonId { get; set; }
        public ProviderAssignmentMode DefaultProviderAssignmentMode { get; set; }

        public string? ContactName { get; set; }
        public string? ContactNumber { get; set; }
        public string? ContactMobile { get; set; }
        public string? ContactEmail { get; set; }

        public string? MappedProviderIds { get; set; }
        public string? MappedPackageIds { get; set; }
        public string? MappedBranchIds { get; set; }
    }
}
