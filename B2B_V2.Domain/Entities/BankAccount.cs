using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class BankAccount : BaseEntity
    {
        public Guid ProviderId { get; set; }
        public Provider? Provider { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string IBAN { get; set; } = string.Empty;
    }
}
