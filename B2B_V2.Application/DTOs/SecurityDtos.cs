using System;
using System.Collections.Generic;

namespace B2B_V2.Application.DTOs
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string FeatureGroup { get; set; } = string.Empty;
    }

    public class AssignPermissionsDto
    {
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }

    public class UserManagementDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public Guid? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public Guid? ProviderId { get; set; }
        public string? ProviderName { get; set; }
        public Guid? BranchId { get; set; }
        public string? BranchName { get; set; }
    }

    public class UpdateUserDto
    {
        public Guid? Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public Guid? CompanyId { get; set; }
        public Guid? ProviderId { get; set; }
        public Guid? BranchId { get; set; }
    }

    public class AssignRoleDto
    {
        public string RoleName { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
