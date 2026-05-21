using System;

namespace B2B_V2.Domain.Entities
{
    public class RolePermission
    {
        public Guid RoleId { get; set; }
        public virtual ApplicationRole Role { get; set; } = null!;

        public Guid PermissionId { get; set; }
        public virtual ApplicationPermission Permission { get; set; } = null!;
    }
}
