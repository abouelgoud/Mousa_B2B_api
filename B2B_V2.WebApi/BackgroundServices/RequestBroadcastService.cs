using B2B_V2.Domain.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.BackgroundServices
{
    public class RequestBroadcastService : BackgroundService
    {
        private readonly ILogger<RequestBroadcastService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;

        public RequestBroadcastService(
            ILogger<RequestBroadcastService> logger, 
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RequestBroadcastService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await BroadcastPendingRequestsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing RequestBroadcastService.");
                }

                // Check every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }

            _logger.LogInformation("RequestBroadcastService is stopping.");
        }

        private async Task BroadcastPendingRequestsAsync()
        {
            int castAfterMinutes = _configuration.GetValue<int>("CastAfter", 2);

            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var hubContext = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<Hubs.NotificationHub>>();

            var now = DateTime.UtcNow;
            var cutoffTime = now.AddMinutes(-castAfterMinutes);

            var pendingRequestsQuery = await unitOfWork.Repository<Request>().FindAsync(
                r => r.Status == RequestStatus.Pending && 
                     r.IsBroadcasted == false &&
                     r.AssignedProviderId == null &&
                     r.CreatedAt <= cutoffTime
            );

            var pendingRequests = pendingRequestsQuery.ToList();
            
            foreach (var req in pendingRequests)
            {
                _logger.LogInformation($"Broadcasting Request {req.CaseID} because it wasn't accepted after {castAfterMinutes} minutes.");
                
                req.IsBroadcasted = true;
                
                // Set AssignedProviderId to null so any provider can pull it.
                req.AssignedProviderId = null; 

                unitOfWork.Repository<Request>().Update(req);

                var userManager = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ApplicationUser>>();
                var providers = await userManager.GetUsersInRoleAsync("HealthCareProvider");
                foreach (var p in providers)
                {
                    var notification = new Notification
                    {
                        UserId = p.Id,
                        CaseId = req.Id,
                        Type = NotificationType.InApp,
                        Message = $"A screening request ({req.CaseID}) was not accepted in time and is now available to be pulled.",
                        IsRead = false,
                        RecipientIdentifier = p.Email ?? string.Empty
                    };
                    await unitOfWork.Repository<Notification>().AddAsync(notification);
                    
                    // Broadcast to this specific provider
                    // We need to save first to get notification.Id
                    await unitOfWork.CompleteAsync();

                    await hubContext.Clients.Group(p.Id.ToString()).SendAsync("ReceiveNotification", new 
                    {
                        id = notification.Id,
                        title = "Open Request Broadcast",
                        message = notification.Message,
                        type = 2,
                        createdAt = DateTime.UtcNow,
                        requestId = req.Id
                    });
                }
                
                // Ensure the request update is saved even if there are no providers
                await unitOfWork.CompleteAsync();
            }
        }
    }
}
