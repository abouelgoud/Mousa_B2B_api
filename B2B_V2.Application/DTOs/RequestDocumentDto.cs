using System;

namespace B2B_V2.Application.DTOs
{
    public class RequestDocumentDto
    {
        public Guid Id { get; set; }
        public Guid RequestId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
    }
}
