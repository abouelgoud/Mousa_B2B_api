using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class AIModelConfiguration : BaseEntity
    {
        public string ModelName { get; set; } = string.Empty;
        public string ModelPath { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string? InputSchema { get; set; } // JSON
        public string? OutputSchema { get; set; } // JSON
    }
}
