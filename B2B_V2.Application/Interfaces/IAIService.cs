using System;
using System.Threading.Tasks;
using B2B_V2.Application.DTOs;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization;

namespace B2B_V2.Application.Interfaces
{
    public interface IAIService
    {
        Task<AIRiskResultDto> AnalyzeScreeningRiskAsync(Guid requestId);
        Task<ComplianceAuditResultDto> RunComplianceAuditAsync(ComplianceAuditRequestDto request);
        Task<AIReportDto> GenerateCaseReportAsync(Guid requestId);
    }

}
