using Microsoft.AspNetCore.Identity;
using System;

namespace B2B_V2.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public Guid? CompanyId { get; set; }
        public Company? Company { get; set; }
        public Guid? ProviderId { get; set; }
        public Provider? Provider { get; set; }
        public Guid? BranchId { get; set; }
        public ProviderBranch? Branch { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? OTPSecret { get; set; }
    }
}
