using System;
using System.Collections.Generic;

namespace B2B_V2.Domain.Entities
{
    public class ApplicationPermission
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string FeatureGroup { get; set; } = string.Empty;

        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
