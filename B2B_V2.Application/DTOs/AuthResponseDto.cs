using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public List<string> Permissions { get; set; } = new List<string>();
        public Guid? CompanyId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid? BranchId { get; set; }
        public string? BranchName { get; set; }
        public List<BranchDto> AvailableBranches { get; set; } = new List<BranchDto>();
    }
}
