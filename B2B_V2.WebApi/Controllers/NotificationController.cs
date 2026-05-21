using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUserNotifications()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return BadRequest("User ID not found in claims.");
            
            var userId = Guid.Parse(userIdClaim);
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            
            return Ok(notifications.Select(n => new
            {
                id = n.Id,
                message = n.Message,
                type = (int)n.Type,
                isRead = n.IsRead,
                createdAt = n.CreatedAt,
                requestId = n.CaseId
            }));
        }

        [HttpPost("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var success = await _notificationService.MarkAsReadAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("debug")]
        public async Task<ActionResult<object>> DebugNotifications()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : Guid.Empty;
            
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            
            return Ok(new
            {
                userIdFromClaim = userIdClaim,
                userId = userId,
                notificationCount = notifications.Count(),
                allClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }
    }
}
