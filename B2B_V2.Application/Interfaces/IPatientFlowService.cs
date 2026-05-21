using B2B_V2.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IPatientFlowService
    {
        Task<bool> CheckInAsync(Guid candidateId, decimal latitude, decimal longitude);
        Task<BranchThroughputDto> GetBranchThroughputAsync(Guid branchId);
    }
    
    public class BranchThroughputDto
    {
        public Guid BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int ActiveCases { get; set; }
        public int WaitingCount { get; set; }
        public double AverageWaitTimeMinutes { get; set; }
        public int UtilizationPercentage { get; set; }
    }
}
