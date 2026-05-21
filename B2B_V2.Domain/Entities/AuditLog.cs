using System;
using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public string EntityType { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Action { get; set; } = string.Empty; // Create, Update, Delete, StatusChange, Login, Logout
        public Guid? ChangedByUserId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? OldValues { get; set; } // JSON
        public string? NewValues { get; set; } // JSON
        public string? Description { get; set; }
    }
}
