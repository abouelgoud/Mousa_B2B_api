using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class FinancialRecord : BaseEntity
    {
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }
        
        public decimal TotalAmount { get; set; }
        public decimal ProviderPayout { get; set; }
        public decimal PlatformFee { get; set; }
        
        public bool IsPaidByCompany { get; set; }
        public DateTime? CompanyPaymentDate { get; set; }
        
        public bool IsProviderPaid { get; set; }
        public DateTime? ProviderPaymentDate { get; set; }
        
        public bool IsFinalized { get; set; }
        public DateTime? FinalizedAt { get; set; }
        
        public string? InvoiceNumber { get; set; }
    }
}
