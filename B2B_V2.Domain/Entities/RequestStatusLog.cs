using B2B_V2.Domain.Common;
using B2B_V2.Domain.Enums;
using System;

namespace B2B_V2.Domain.Entities
{
    public class RequestStatusLog : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        public RequestStatus Status { get; set; }
        public string? Comment { get; set; }
        public Guid ChangedByUserId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
