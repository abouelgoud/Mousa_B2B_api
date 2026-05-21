using System;

namespace B2B_V2.Application.DTOs
{
    public class BranchDto
    {
        public Guid Id { get; set; }
        public Guid ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ContactPersonName { get; set; } = string.Empty;
        public string ContactPersonPhone { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
