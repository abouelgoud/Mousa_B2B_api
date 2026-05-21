using System;

namespace B2B_V2.Domain.Entities
{
    public class ProviderService
    {
        public Guid ProviderId { get; set; }
        public Provider? Provider { get; set; }
        public Guid ServiceId { get; set; }
        public Service? Service { get; set; }
        public decimal? Price { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
