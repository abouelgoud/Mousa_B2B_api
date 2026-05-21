using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class ProviderTier
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Tier 1, 2, 3
        public string Description { get; set; } = string.Empty;
    }
}
