using B2B_V2.Domain.Common;
using System.Collections.Generic;

namespace B2B_V2.Domain.Entities
{
    public class Package : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }

        public ICollection<PackageService> PackageServices { get; set; } = new List<PackageService>();
    }
}
