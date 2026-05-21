using Microsoft.AspNetCore.Identity;
using System;

namespace B2B_V2.Domain.Entities
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        public ApplicationRole() : base() { }
        public ApplicationRole(string roleName) : base() 
        { 
            Name = roleName;
            NormalizedName = roleName.ToUpper();
        }

        public string? Description { get; set; }
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
