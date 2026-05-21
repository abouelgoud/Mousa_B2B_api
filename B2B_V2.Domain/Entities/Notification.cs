using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Domain.Entities
{
    public class Notification : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid? CaseId { get; set; }
        public NotificationType Type { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string RecipientIdentifier { get; set; } = string.Empty; // Mobile for SMS, Email for Email
    }
}
