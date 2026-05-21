using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class PatientFlowService : IPatientFlowService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICaseService _caseService;

        public PatientFlowService(IUnitOfWork unitOfWork, ICaseService caseService)
        {
            _unitOfWork = unitOfWork;
            _caseService = caseService;
        }

        public async Task<bool> CheckInAsync(Guid candidateId, decimal latitude, decimal longitude)
        {
            // 1. Find active request for candidate
            var requests = await _unitOfWork.Repository<Request>().FindAsync(
                r => r.CandidateId == candidateId && 
                (r.Status == RequestStatus.Accepted || r.Status == RequestStatus.Pending),
                r => r.AssignedProvider!, r => r.Branch!
            );
            
            var activeRequest = requests.FirstOrDefault();
            
            if (activeRequest == null) return false;

            // 2. Validate Geofence (if branch has coordinates)
            if (activeRequest.Branch != null && activeRequest.Branch.Latitude.HasValue && activeRequest.Branch.Longitude.HasValue)
            {
                var distance = CalculateDistance(
                    (double)latitude, (double)longitude,
                    (double)activeRequest.Branch.Latitude.Value, (double)activeRequest.Branch.Longitude.Value
                );

                // Geofence radius: 200 meters (0.2 km)
                if (distance > 0.2) return false; 
            }
            // If no branch coordinates, we might allow manual check-in or skip validation

            // 3. Update Status
            await _caseService.UpdateCaseStatusAsync(activeRequest.Id, RequestStatus.CheckedIn);
            
            return true;
        }

        public async Task<BranchThroughputDto> GetBranchThroughputAsync(Guid branchId)
        {
            var branch = await _unitOfWork.Repository<ProviderBranch>().GetByIdAsync(branchId);
            if (branch == null) return new BranchThroughputDto();

            var activeRequests = await _unitOfWork.Repository<Request>().GetAllAsync();
            var branchRequests = activeRequests.Where(r => r.BranchId == branchId).ToList();

            var waiting = branchRequests.Count(r => r.Status == RequestStatus.CheckedIn);
            var energetic = branchRequests.Count(r => r.Status == RequestStatus.ExaminationStarted);

            return new BranchThroughputDto
            {
                BranchId = branch.Id,
                BranchName = branch.Address, // Using address as name if name missing
                Capacity = branch.Capacity,
                ActiveCases = energetic,
                WaitingCount = waiting,
                UtilizationPercentage = branch.Capacity > 0 ? (int)((double)(energetic + waiting) / branch.Capacity * 100) : 0,
                AverageWaitTimeMinutes = waiting * 15 // Mock logic: 15 mins per person
            };
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Earth's radius in KM
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double deg) => deg * (Math.PI / 180);
    }
}
