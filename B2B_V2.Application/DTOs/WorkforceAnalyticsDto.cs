using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class WorkforceAnalyticsDto
    {
        public WorkforceStatsDto Stats { get; set; } = new();
        public List<HealthTrendDto> HealthTrends { get; set; } = new();
        public List<RiskCategoryDto> RiskDistribution { get; set; } = new();
        public List<string> TopRiskFactors { get; set; } = new();
    }

    public class WorkforceStatsDto
    {
        public int TotalCandidates { get; set; }
        public int HighRiskCases { get; set; }
        public double AverageConfidence { get; set; }
        public int FitToWorkCount { get; set; }
    }

    public class HealthTrendDto
    {
        public string Period { get; set; } = string.Empty;
        public int LowRiskCount { get; set; }
        public int MediumRiskCount { get; set; }
        public int HighRiskCount { get; set; }
    }

    public class RiskCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}
