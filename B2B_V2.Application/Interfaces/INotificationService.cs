using B2B_V2.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(Guid userId, string message, B2B_V2.Domain.Enums.NotificationType type, Guid? caseId = null);
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId);
        Task<bool> MarkAsReadAsync(Guid notificationId);
    }
}
