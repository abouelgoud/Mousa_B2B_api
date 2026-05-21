using System;
using System.ComponentModel.DataAnnotations;

namespace B2B_V2.Domain.Entities
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid RequestId { get; set; }
        public Request? Request { get; set; }

        [Required]
        public string SenderId { get; set; } = string.Empty; // UserId of the sender

        [Required]
        public string SenderName { get; set; } = string.Empty;

        [Required]
        public string SenderRole { get; set; } = string.Empty; // "Client" or "Provider"

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
