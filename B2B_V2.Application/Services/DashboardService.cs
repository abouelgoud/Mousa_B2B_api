using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class DashboardService : IDashboardService
    {
        // Service responsible for aggregating dashboard analytics
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardDataDto> GetDashboardDataAsync(Guid? companyId = null, Guid? providerId = null)
        {
            var requestsRepo = _unitOfWork.Repository<Request>();
            var allRequestsQuery = await requestsRepo.GetAllAsync(r => r.Candidate!, r => r.Company!, r => r.RequestedProvider!, r => r.AssignedProvider!);
            
            var allRequests = allRequestsQuery.AsQueryable();

            if (companyId.HasValue)
                allRequests = allRequests.Where(r => r.CompanyId == companyId.Value);
            
            if (providerId.HasValue)
                allRequests = allRequests.Where(r => r.AssignedProviderId == providerId.Value || r.RequestedProviderId == providerId.Value);

            var pendingArrived = allRequests.Where(r => r.Status == RequestStatus.Pending || r.Status == RequestStatus.Accepted || r.Status == RequestStatus.CheckedIn);
            var underTesting = allRequests.Where(r => r.Status == RequestStatus.ExaminationStarted);
            var reportsReady = allRequests.Where(r => r.Status == RequestStatus.AuthorizedSubmitted);

            // 1. Gather Stats
            var stats = new DashboardStatsDto
            {
                TotalRequests = allRequests.Count(),
                PendingArrived = pendingArrived.Count(),
                UnderTesting = underTesting.Count(),
                ReportsReady = reportsReady.Count(),
                
                // Real Financials
                CompletedCases = allRequests.Count(r => r.Status == RequestStatus.AuthorizedSubmitted),
                TotalRevenue = 0,
                TotalPayouts = 0,
                TotalFees = 0
            };

            // Calculate Financials from FinancialRecords
            var financialRepo = _unitOfWork.Repository<FinancialRecord>();
            // We need to fetch records linked to the filtered requests. 
            // Since we can't easily join in this generic repo pattern without specific methods, 
            // we will fetch all relevant records if the dataset is small, or use a specific query if possible.
            // For now, let's fetch all and filter in memory or rely on RequestId matching if possible.
            // Better approach: Get IDs of filtered requests first.
            var requestIds = allRequests.Select(r => r.Id).ToList();
            
            if (requestIds.Any())
            {
                var financials = await financialRepo.FindAsync(f => requestIds.Contains(f.RequestId), f => f.Request!);
                if (financials.Any())
                {
                    stats.TotalRevenue = financials.Sum(f => f.TotalAmount);
                    stats.TotalPayouts = financials.Sum(f => f.ProviderPayout);
                    stats.TotalFees = financials.Sum(f => f.PlatformFee);
                }
            }

            // 2. Fetch Recent Requests (In-Memory for MVP)
            var recentRequests = allRequests
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new DashboardRequestDto
                {
                    Id = r.Id,
                    CaseId = r.CaseID,
                    CandidateName = r.Candidate != null ? r.Candidate.FullName : "N/A",
                    CompanyName = r.Company != null ? r.Company.LegalName : "Unknown", 
                    Status = r.Status.ToString(),
                    SubmissionDate = r.CreatedAt
                })
                .ToList();

            // 3. Generate Real Dynamic Insights
            var aiInsights = new List<DashboardInsightDto>();

            // Insight 1: Efficiency (Avg Turnaround Time for Completed Cases)
            var completedCases = allRequests.Where(r => r.Status == RequestStatus.AuthorizedSubmitted).ToList();
            if (completedCases.Any())
            {
                var avgDays = completedCases.Average(r => (DateTime.UtcNow - r.CreatedAt).TotalDays);
                aiInsights.Add(new DashboardInsightDto
                {
                    Header = "Efficiency Score",
                    Value = $"{avgDays:F1} Days",
                    Description = "Average turnaround time for completed cases.",
                    Icon = "bi-speedometer2",
                    ColorClass = "text-info"
                });
            }

            // Insight 2: Volume Trend (Last 7 Days vs Previous 7 Days)
            var last7Days = allRequests.Count(r => r.CreatedAt >= DateTime.UtcNow.AddDays(-7));
            var prev7Days = allRequests.Count(r => r.CreatedAt >= DateTime.UtcNow.AddDays(-14) && r.CreatedAt < DateTime.UtcNow.AddDays(-7));
            
            string trendValue;
            string trendDesc;
            string trendIcon = "bi-graph-up-arrow";
            string trendColor = "text-success";

            if (prev7Days == 0)
            {
                trendValue = last7Days > 0 ? "+100%" : "0%";
                trendDesc = "New activity detected this week.";
            }
            else
            {
                var change = ((double)(last7Days - prev7Days) / prev7Days) * 100;
                trendValue = $"{change:F1}%";
                trendDesc = change >= 0 ? "Increase in case volume vs last week." : "Decrease in case volume vs last week.";
                if (change < 0) { trendIcon = "bi-graph-down-arrow"; trendColor = "text-warning"; }
            }

            // ... (Existing Insights Logic) ...

            // 4. Chart Data Generation
            
            // 4a. Requests By Status (Pie/Doughnut)
            var statusGroups = allRequests.GroupBy(r => r.Status).Select(g => new { Status = g.Key, Count = g.Count() }).ToList();
            var statusChart = new ChartDataDto
            {
                Labels = statusGroups.Select(g => g.Status.ToString()).ToList(),
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto
                    {
                        Label = "Cases",
                        Data = statusGroups.Select(g => g.Count).ToList(),
                        BackgroundColor = "#3b82f6", // dynamic colors can be handled in FE or here
                    }
                }
            };

            // 4b. Requests Over Time (Last 6 Months) - Line/Bar
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
             var timeGroups = allRequests
                .Where(r => r.CreatedAt >= sixMonthsAgo)
                .AsEnumerable() // Client-side grouping for date formatting if EF fails
                .GroupBy(r => r.CreatedAt.ToString("MMM yyyy"))
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToList();
            
            var timeChart = new ChartDataDto
            {
                Labels = timeGroups.Select(g => g.Month).ToList(),
                Datasets = new List<ChartDatasetDto>
                {
                    new ChartDatasetDto
                    {
                        Label = "Volume",
                        Data = timeGroups.Select(g => g.Count).ToList(),
                        BackgroundColor = "#10b981",
                        Fill = true
                    }
                }
            };

            // 4c. Top Entities (Admin Only mainly, but logic can adapt)
            var topEntities = new ChartDataDto();
            if (!companyId.HasValue && !providerId.HasValue) // Admin
            {
                var topProviders = allRequests
                    .Where(r => r.AssignedProvider != null)
                    .GroupBy(r => r.AssignedProvider.LegalName)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new { Name = g.Key, Count = g.Count() })
                    .ToList();
                
                 topEntities = new ChartDataDto
                {
                    Labels = topProviders.Select(g => g.Name).ToList(),
                    Datasets = new List<ChartDatasetDto>
                    {
                        new ChartDatasetDto
                        {
                            Label = "Top Providers",
                            Data = topProviders.Select(g => g.Count).ToList(),
                            BackgroundColor = "#8b5cf6"
                        }
                    }
                };
            }
            // For Company/Provider we could show other stats, but leaving empty for now or reusing structure.

            return new DashboardDataDto
            {
                Stats = stats,
                RecentRequests = recentRequests,
                AIInsights = aiInsights,
                RequestsByStatus = statusChart,
                RequestsOverTime = timeChart,
                TopEntities = topEntities
            };
        }
    }
}
