using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAIService _aiService;

        public AnalyticsService(IUnitOfWork unitOfWork, IAIService aiService)
        {
            _unitOfWork = unitOfWork;
            _aiService = aiService;
        }

        public async Task<WorkforceAnalyticsDto> GetWorkforceAnalyticsAsync(Guid id)
        {
            var requests = (await _unitOfWork.Repository<Request>().FindAsync(
                r => r.CompanyId == id || r.AssignedProviderId == id,
                r => r.MedicalResult!))
                .ToList();

            var analytics = new WorkforceAnalyticsDto();

            if (!requests.Any()) return analytics;

            // 1. Calculate Stats
            analytics.Stats.TotalCandidates = requests.Count;
            analytics.Stats.FitToWorkCount = requests.Count(r => r.MedicalResult?.IsFitForWork == true);
            
            // For risk analysis, we'll use the AI service logic but aggregated
            var risks = new List<AIRiskResultDto>();
            foreach (var req in requests.Where(r => r.MedicalResult != null))
            {
                risks.Add(await _aiService.AnalyzeScreeningRiskAsync(req.Id));
            }

            analytics.Stats.HighRiskCases = risks.Count(r => r.RiskLevel == "High");
            analytics.Stats.AverageConfidence = risks.Any() ? risks.Average(r => r.ConfidenceScore) : 0;

            // 2. Risk Distribution
            analytics.RiskDistribution = risks
                .GroupBy(r => r.RiskLevel)
                .Select(g => new RiskCategoryDto
                {
                    Category = g.Key,
                    Count = g.Count(),
                    Color = GetRiskColor(g.Key)
                }).ToList();

            // 3. Health Trends (Mocking periods for demo if not enough data)
            var periods = new[] { "Sep", "Oct", "Nov", "Dec", "Jan" };
            foreach (var p in periods)
            {
                analytics.HealthTrends.Add(new HealthTrendDto
                {
                    Period = p,
                    LowRiskCount = new Random().Next(10, 50),
                    MediumRiskCount = new Random().Next(5, 15),
                    HighRiskCount = new Random().Next(0, 5)
                });
            }

            // 4. Top Risk Factors
            analytics.TopRiskFactors = new List<string> { "Hypertension", "BMI > 30", "Vision Impairment", "Chronic Stress" };

            return analytics;
        }

        private string GetRiskColor(string level) => level switch
        {
            "High" => "#dc3545",
            "Medium" => "#ffc107",
            "Low" => "#198754",
            _ => "#6c757d"
        };

        public async Task<SLADashboardDto> GetSlaDashboardAsync(Guid? companyId, Guid? providerId)
        {
            var query = await _unitOfWork.Repository<Request>().FindAsync(r => 
                (!companyId.HasValue || r.CompanyId == companyId.Value) && 
                (!providerId.HasValue || r.AssignedProviderId == providerId.Value),
                r => r.StatusLogs,
                r => r.Package!);

            var requests = query.ToList();
            var dashboard = new SLADashboardDto();
            
            dashboard.TotalRequests = requests.Count;
            
            var completedRequests = requests.Where(r => r.Status == B2B_V2.Domain.Enums.RequestStatus.Closed || r.Status == B2B_V2.Domain.Enums.RequestStatus.AuthorizedSubmitted).ToList();
            dashboard.CompletedRequests = completedRequests.Count;

            var totalHours = 0.0;
            var compliantCount = 0;

            foreach(var req in completedRequests)
            {
                var createdLog = req.StatusLogs.OrderBy(l => l.Timestamp).FirstOrDefault();
                var completedLog = req.StatusLogs.OrderByDescending(l => l.Timestamp).FirstOrDefault(l => l.Status == B2B_V2.Domain.Enums.RequestStatus.Closed || l.Status == B2B_V2.Domain.Enums.RequestStatus.AuthorizedSubmitted);
                
                if (createdLog != null && completedLog != null)
                {
                    var hours = (completedLog.Timestamp - createdLog.Timestamp).TotalHours;
                    totalHours += hours;
                    if (hours <= 48) compliantCount++;
                }
            }

            dashboard.AverageTurnaroundHours = completedRequests.Count > 0 ? Math.Round(totalHours / completedRequests.Count, 2) : 0;
            dashboard.ComplianceRate = completedRequests.Count > 0 ? Math.Round((double)compliantCount / completedRequests.Count * 100, 2) : 0;

            // Group packages
            dashboard.PackageVolumes = requests.Where(r => r.Package != null)
                .GroupBy(r => r.Package!.Name)
                .Select(g => new PackageVolumeDto
                {
                    PackageName = g.Key,
                    Count = g.Count()
                }).ToList();

            // Mock trends for demo
            var periods = new[] { "Sep", "Oct", "Nov", "Dec", "Jan", "Feb" };
            foreach (var p in periods)
            {
                dashboard.TurnaroundTrends.Add(new TurnaroundTrendDto
                {
                    Month = p,
                    AverageHours = new Random().Next(24, 72)
                });
            }

            return dashboard;
        }
        public async Task<IEnumerable<SLADetailDto>> GetSlaDetailsAsync(string metricType, Guid? companyId, Guid? providerId)
        {
            var query = await _unitOfWork.Repository<Request>().FindAsync(r => 
                (!companyId.HasValue || r.CompanyId == companyId.Value) && 
                (!providerId.HasValue || r.AssignedProviderId == providerId.Value),
                r => r.StatusLogs,
                r => r.Package!,
                r => r.Candidate!);

            var requests = query.ToList();

            if (metricType == "completed")
            {
                requests = requests.Where(r => r.Status == B2B_V2.Domain.Enums.RequestStatus.Closed || r.Status == B2B_V2.Domain.Enums.RequestStatus.AuthorizedSubmitted).ToList();
            }

            var details = new List<SLADetailDto>();

            foreach (var req in requests)
            {
                var createdLog = req.StatusLogs.OrderBy(l => l.Timestamp).FirstOrDefault();
                var completedLog = req.StatusLogs.OrderByDescending(l => l.Timestamp).FirstOrDefault(l => l.Status == B2B_V2.Domain.Enums.RequestStatus.Closed || l.Status == B2B_V2.Domain.Enums.RequestStatus.AuthorizedSubmitted);
                
                var hours = 0.0;
                var isCompliant = false;

                if (createdLog != null && completedLog != null)
                {
                    hours = (completedLog.Timestamp - createdLog.Timestamp).TotalHours;
                    isCompliant = hours <= 48;
                }

                // If filtering by non-compliant
                if (metricType == "non-compliant" && isCompliant)
                    continue;

                details.Add(new SLADetailDto
                {
                    RequestId = req.Id,
                    CaseID = req.CaseID,
                    CandidateName = req.Candidate?.FullName ?? "Unknown",
                    PackageName = req.Package?.Name ?? "N/A",
                    Status = req.Status.ToString(),
                    CreatedAt = createdLog?.Timestamp ?? DateTime.UtcNow,
                    CompletedAt = completedLog?.Timestamp,
                    TurnaroundHours = Math.Round(hours, 2),
                    IsCompliant = isCompliant,
                    History = req.StatusLogs.OrderByDescending(l => l.Timestamp).Select(l => new SLAStatusHistoryDto
                    {
                        Status = l.Status.ToString(),
                        Timestamp = l.Timestamp,
                        Comment = l.Comment
                    }).ToList()
                });
            }

            return details.OrderByDescending(d => d.CreatedAt);
        }
    }
}
