using System;

namespace B2B_V2.Application.DTOs
{
    public class AIRiskResultDto
    {
        public Guid RequestId { get; set; }
        public string RiskLevel { get; set; } = "Low"; // Low, Medium, High
        public string AIInsightSummary { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; }
    }
}
