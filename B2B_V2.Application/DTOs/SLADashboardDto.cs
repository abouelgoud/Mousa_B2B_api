using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class SLADashboardDto
    {
        public int TotalRequests { get; set; }
        public int CompletedRequests { get; set; }
        public double AverageTurnaroundHours { get; set; }
        public double ComplianceRate { get; set; } // % of requests completed within SLA (e.g. 48 hours)

        public List<TurnaroundTrendDto> TurnaroundTrends { get; set; } = new();
        public List<PackageVolumeDto> PackageVolumes { get; set; } = new();
    }

    public class TurnaroundTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public double AverageHours { get; set; }
    }

    public class PackageVolumeDto
    {
        public string PackageName { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
