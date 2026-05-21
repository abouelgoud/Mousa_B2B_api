using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class Service : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
