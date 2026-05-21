using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class DashboardDataDto
    {
        public DashboardStatsDto Stats { get; set; }
        public List<DashboardRequestDto> RecentRequests { get; set; }
        public List<DashboardInsightDto> AIInsights { get; set; }
        
        // New Chart Data Properties
        public ChartDataDto RequestsByStatus { get; set; }
        public ChartDataDto RequestsOverTime { get; set; }
        public ChartDataDto TopEntities { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalRequests { get; set; }
        public int PendingArrived { get; set; }
        public int UnderTesting { get; set; }
        public int ReportsReady { get; set; }
        
        // Financials
        public decimal TotalRevenue { get; set; }
        public decimal TotalPayouts { get; set; }
        public decimal TotalFees { get; set; }
        public int CompletedCases { get; set; }
    }

    public class DashboardRequestDto
    {
        public Guid Id { get; set; }
        public string CaseId { get; set; }
        public string CandidateName { get; set; }
        public string CompanyName { get; set; }
        public string Status { get; set; }
        public DateTime SubmissionDate { get; set; }
    }

    public class DashboardInsightDto
    {
        public string Header { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string ColorClass { get; set; }
    }

    // New Chart DTOs
    public class ChartDataDto
    {
        public List<string> Labels { get; set; } = new List<string>();
        public List<ChartDatasetDto> Datasets { get; set; } = new List<ChartDatasetDto>();
    }

    public class ChartDatasetDto
    {
        public string Label { get; set; }
        public List<int> Data { get; set; } = new List<int>();
        public string BackgroundColor { get; set; }
        public string BorderColor { get; set; }
        public bool Fill { get; set; } = false;
    }
}
