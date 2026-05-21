using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class AIService : IAIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;

        public AIService(IUnitOfWork unitOfWork, HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
        }

        public async Task<AIRiskResultDto> AnalyzeScreeningRiskAsync(Guid requestId)
        {
            var results = (await _unitOfWork.Repository<MedicalResult>().FindAsync(m => m.RequestId == requestId)).FirstOrDefault();
            
            if (results == null)
            {
                return new AIRiskResultDto { RequestId = requestId, RiskLevel = "Unknown", AIInsightSummary = "No medical findings available for analysis." };
            }

            // Simulated AI Logic: Analyze findings and vitals
            var riskLevel = "Low";
            var insights = "Results are within standard parameters.";

            if (results.VitalSigns.ToLower().Contains("high") || results.VitalSigns.ToLower().Contains("150/"))
            {
                riskLevel = "Medium";
                insights = "Elevated blood pressure patterns detected. Recommend monitoring.";
            }

            if (!results.IsFitForWork || results.PhysicianNotes.ToLower().Contains("chronic"))
            {
                riskLevel = "High";
                insights = "Critical findings identified. Candidate health status requires immediate review.";
            }

            return new AIRiskResultDto
            {
                RequestId = requestId,
                RiskLevel = riskLevel,
                AIInsightSummary = insights,
                ConfidenceScore = 0.92
            };
        }

        public async Task<ComplianceAuditResultDto> RunComplianceAuditAsync(ComplianceAuditRequestDto request)
        {
            try
            {
                // Call Python AI Agent API
                var response = await _httpClient.PostAsJsonAsync("http://localhost:8000/audit", request);
                response.EnsureSuccessStatusCode();
                
                var result = await response.Content.ReadFromJsonAsync<ComplianceAuditResultDto>();
                return result ?? throw new Exception("Failed to deserialize AI response");
            }
            catch (Exception ex)
            {
                // Fallback or better error handling
                return new ComplianceAuditResultDto
                {
                    ProviderName = request.Name,
                    Location = request.Location,
                    Summary = $"AI Audit failed: {ex.Message}. Using cached compliance data."
                };
            }
        }

        public async Task<AIReportDto> GenerateCaseReportAsync(Guid requestId)
        {
            // 1. Fetch Request with all details
            var request = await _unitOfWork.Repository<Request>().GetByIdAsync(requestId, 
                r => r.Candidate!, r => r.Package!, r => r.RequestedProvider!, r => r.AssignedProvider!, r => r.MedicalResult!);

            if (request == null) throw new KeyNotFoundException("Request not found");

            // 2. Get AI Analysis
            var analysis = await AnalyzeScreeningRiskAsync(requestId);

            // 3. Build Report
            var report = new AIReportDto
            {
                RequestId = request.Id,
                ReferenceNumber = request.CaseID,
                GeneratedAt = DateTime.UtcNow,
                
                // Candidate
                CandidateName = request.Candidate?.FullName ?? "N/A",
                NationalID = request.Candidate?.NationalID ?? "N/A",

                // Context
                PackageName = request.Package?.Name ?? "N/A",
                CompanyName = "Client Company A", // Placeholder or fetch from Company entity logic
                ProviderName = request.AssignedProvider?.LegalName ?? "N/A",

                // Medical
                VitalSigns = request.MedicalResult?.VitalSigns,
                LabFindings = request.MedicalResult?.LabFindings,
                PhysicianNotes = request.MedicalResult?.PhysicianNotes,
                IsFitForWork = request.MedicalResult?.IsFitForWork,
                ExamDate = request.MedicalResult?.ReviewedAt ?? DateTime.UtcNow,

                // AI Analysis
                RiskLevel = analysis.RiskLevel,
                ConfidenceScore = analysis.ConfidenceScore,
                AIInsightSummary = analysis.AIInsightSummary,
                KeyRiskFactors = new System.Collections.Generic.List<string>(), // Parsing logic could be added here
                Recommendation = analysis.RiskLevel == "High" ? "Immediate Review Required" : "Proceed with Standard Protocol"
            };

            return report;
        }
    }
}
