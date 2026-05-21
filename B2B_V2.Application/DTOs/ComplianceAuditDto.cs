using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace B2B_V2.Application.DTOs
{
    public class ComplianceAuditRequestDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;
    }

    public class ComplianceAuditResultDto
    {
        [JsonPropertyName("provider_name")]
        public string ProviderName { get; set; } = string.Empty;

        [JsonPropertyName("location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("is_verified")]
        public bool IsVerified { get; set; }

        [JsonPropertyName("license_number")]
        public string? LicenseNumber { get; set; }

        [JsonPropertyName("audit_score")]
        public int AuditScore { get; set; }

        [JsonPropertyName("findings")]
        public List<string> Findings { get; set; } = new();

        [JsonPropertyName("summary")]
        public string Summary { get; set; } = string.Empty;
    }
}
