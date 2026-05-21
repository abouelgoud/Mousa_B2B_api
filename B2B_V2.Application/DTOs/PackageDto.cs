using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class PackageDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; }
        public decimal Price { get; set; }
        public List<ServiceDto> Services { get; set; } = new List<ServiceDto>();
    }

    public class PackageCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public List<Guid> ServiceIds { get; set; } = new List<Guid>();
    }
}
