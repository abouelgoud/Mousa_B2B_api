using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace B2B_V2.WebApi.Hubs
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public Guid RequestId { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class OrderChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrderChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task JoinOrderGroup(string orderId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, orderId);

            // Fetch chat history
            var messages = await _unitOfWork.Repository<ChatMessage>().FindAsync(m => m.RequestId == Guid.Parse(orderId));
            var history = messages.OrderBy(m => m.SentAt).Select(m => new ChatMessageDto
            {
                Id = m.Id,
                RequestId = m.RequestId,
                SenderId = m.SenderId,
                SenderName = m.SenderName,
                SenderRole = m.SenderRole,
                Content = m.Content,
                SentAt = m.SentAt
            }).ToList();

            await Clients.Caller.SendAsync("LoadHistory", history);
        }

        public async Task LeaveOrderGroup(string orderId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, orderId);
        }

        public async Task SendMessage(string orderId, string senderId, string senderName, string senderRole, string content)
        {
            var message = new ChatMessage
            {
                RequestId = Guid.Parse(orderId),
                SenderId = senderId,
                SenderName = senderName,
                SenderRole = senderRole,
                Content = content,
                SentAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<ChatMessage>().AddAsync(message);
            await _unitOfWork.CompleteAsync();

            var dto = new ChatMessageDto
            {
                Id = message.Id,
                RequestId = message.RequestId,
                SenderId = message.SenderId,
                SenderName = message.SenderName,
                SenderRole = message.SenderRole,
                Content = message.Content,
                SentAt = message.SentAt
            };

            await Clients.Group(orderId).SendAsync("ReceiveMessage", dto);
        }
    }
}
