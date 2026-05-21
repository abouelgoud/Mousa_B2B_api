using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task SendNotificationAsync(Guid userId, string message, NotificationType type, Guid? caseId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                Type = type,
                CaseId = caseId,
                IsRead = false,
                RecipientIdentifier = "" // Could be populated if sending SMS/Email
            };

            await _unitOfWork.Repository<Notification>().AddAsync(notification);
            await _unitOfWork.CompleteAsync();
            
            // Note: Real-time SignalR push would happen here or via a decorator in WebApi
        }

        public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId)
        {
            var notifications = await _unitOfWork.Repository<Notification>().FindAsync(n => n.UserId == userId);
            return notifications.OrderByDescending(n => n.CreatedAt);
        }

        public async Task<bool> MarkAsReadAsync(Guid notificationId)
        {
            var notification = await _unitOfWork.Repository<Notification>().GetByIdAsync(notificationId);
            if (notification == null) return false;

            notification.IsRead = true;
            _unitOfWork.Repository<Notification>().Update(notification);
            return await _unitOfWork.CompleteAsync() > 0;
        }
    }
}
