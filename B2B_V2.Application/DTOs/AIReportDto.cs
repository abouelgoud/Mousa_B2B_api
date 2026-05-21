using System;
using System.Collections.Generic;
using B2B_V2.Domain.Enums;

namespace B2B_V2.Application.DTOs
{
    public class AIReportDto
    {
        public Guid RequestId { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }

        // Candidate Info
        public string CandidateName { get; set; } = string.Empty;
        public string NationalID { get; set; } = string.Empty;
        
        // Context
        public string PackageName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;

        // Medical Data
        public string? VitalSigns { get; set; }
        public string? LabFindings { get; set; }
        public string? PhysicianNotes { get; set; }
        public bool? IsFitForWork { get; set; }
        public DateTime? ExamDate { get; set; }

        // AI Analysis
        public string RiskLevel { get; set; } = "Unknown";
        public double ConfidenceScore { get; set; }
        public string AIInsightSummary { get; set; } = string.Empty;
        public List<string> KeyRiskFactors { get; set; } = new();
        public string Recommendation { get; set; } = string.Empty;
    }
}
