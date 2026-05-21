using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class RequestAdditionalService : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        public Guid ServiceId { get; set; }
        public Service? Service { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        public Guid AddedByUserId { get; set; }
    }
}
