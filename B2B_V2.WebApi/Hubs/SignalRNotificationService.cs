using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Hubs
{
    public class SignalRNotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly INotificationService _innerService;

        public SignalRNotificationService(IHubContext<NotificationHub> hubContext, IServiceProvider serviceProvider)
        {
            _hubContext = hubContext;
            // We use the original service for DB persistence
            // Using service provider to avoid circular dependency if any
            _innerService = (INotificationService)serviceProvider.GetService(typeof(B2B_V2.Application.Services.NotificationService))!;
        }

        public async Task SendNotificationAsync(Guid userId, string message, NotificationType type, Guid? caseId = null)
        {
            // 1. Persist to DB
            await _innerService.SendNotificationAsync(userId, message, type, caseId);

            // 2. Push to SignalR group (Group name is the UserId)
            await _hubContext.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                message,
                type = type.ToString(),
                caseId,
                createdAt = DateTime.UtcNow
            });
        }

        public Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId)
        {
            return _innerService.GetUserNotificationsAsync(userId);
        }

        public Task<bool> MarkAsReadAsync(Guid notificationId)
        {
            return _innerService.MarkAsReadAsync(notificationId);
        }
    }
}
