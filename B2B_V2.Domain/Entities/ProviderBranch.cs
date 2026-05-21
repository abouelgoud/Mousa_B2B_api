using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class ProviderBranch : BaseEntity
    {
        public Guid ProviderId { get; set; }
        public Provider? Provider { get; set; }
        public string Address { get; set; } = string.Empty;
        public string ContactPersonName { get; set; } = string.Empty;
        public string ContactPersonPhone { get; set; } = string.Empty;
        public int Capacity { get; set; }
        
        // Geofencing
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
