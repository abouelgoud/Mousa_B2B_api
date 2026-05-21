using System;

namespace B2B_V2.Application.DTOs
{
    public class FinancialRecordDto
    {
        public Guid Id { get; set; }
        public Guid RequestId { get; set; }
        public string? CaseID { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal ProviderPayout { get; set; }
        public decimal PlatformFee { get; set; }
        public bool IsPaidByCompany { get; set; }
        public bool IsProviderPaid { get; set; }
        public string? InvoiceNumber { get; set; }
        public bool IsFinalized { get; set; }
        public DateTime? FinalizedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FinancialSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalPayouts { get; set; }
        public decimal TotalFees { get; set; }
        public int CompletedCases { get; set; }
        
        // Extended for Reports UI
        public decimal PendingPayouts { get; set; }
        public int TotalInvoices { get; set; }
        public ChartDataDto RevenueTrend { get; set; }
    }
}
