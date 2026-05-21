using Microsoft.AspNetCore.Http;
using B2B_V2.Domain.Enums;
using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class ProviderRegistrationCreateDto
    {
        public string LegalName { get; set; } = string.Empty;
        public IFormFile CRCertificateFile { get; set; } // Required
        public IFormFile MOHLicenseFile { get; set; } // Required
        public IFormFile? CBAHIAccreditationFile { get; set; }
        public IFormFile? LabAccreditationFile { get; set; }
        public string? BranchLocations { get; set; }
        public Guid PrimaryContactPersonId { get; set; }
        public int EstimatedDailyOperationalCapacity { get; set; }
        public LabSetup LabSetup { get; set; }
        public int TierId { get; set; }
        public Guid BankAccountId { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        public string? ContactName { get; set; }
        public string? ContactNumber { get; set; }
        public string? ContactMobile { get; set; }
        public string? ContactEmail { get; set; }
    }
}
