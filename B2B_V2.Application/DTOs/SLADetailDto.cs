using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class SLADetailDto
    {
        public Guid RequestId { get; set; }
        public string CaseID { get; set; } = string.Empty;
        public string CandidateName { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public double TurnaroundHours { get; set; }
        public bool IsCompliant { get; set; }
        
        public List<SLAStatusHistoryDto> History { get; set; } = new();
    }

    public class SLAStatusHistoryDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Comment { get; set; }
    }
}
