using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class RequestDocument : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public Guid UploadedByUserId { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
