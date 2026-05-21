using System;

namespace B2B_V2.Domain.Entities
{
    public class PackageService
    {
        public Guid PackageId { get; set; }
        public Package? Package { get; set; }
        public Guid ServiceId { get; set; }
        public Service? Service { get; set; }
    }
}
