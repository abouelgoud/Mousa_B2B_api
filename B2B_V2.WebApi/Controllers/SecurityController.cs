using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using B2B_V2.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SecurityController : ControllerBase
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthService _authService;

        public SecurityController(
            RoleManager<ApplicationRole> roleManager, 
            UserManager<ApplicationUser> userManager,
            IUnitOfWork unitOfWork,
            IAuthService authService)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
            _authService = authService;
        }

        [HttpPost("users")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> CreateUser(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (!result) return BadRequest("Could not create user. Ensure email is unique and password meets requirements.");
            return Ok();
        }

        [HttpGet("roles")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
        {
            var roles = await _roleManager.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .ToListAsync();

            return Ok(roles.Select(r => new RoleDto
            {
                Id = r.Id,
                Name = r.Name!,
                Description = r.Description,
                Permissions = r.RolePermissions.Select(rp => rp.Permission.Name).ToList(),
                PermissionIds = r.RolePermissions.Select(rp => rp.PermissionId).ToList()
            }));
        }

        [HttpGet("roles/{id}")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<RoleDto>> GetRoleById(Guid id)
        {
            var role = await _roleManager.Roles
                .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null) return NotFound("Role not found");

            return Ok(new RoleDto
            {
                Id = role.Id,
                Name = role.Name!,
                Description = role.Description,
                Permissions = role.RolePermissions.Select(rp => rp.Permission.Name).ToList(),
                PermissionIds = role.RolePermissions.Select(rp => rp.PermissionId).ToList()
            });
        }

        [HttpPost("roles")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<RoleDto>> CreateRole(RoleDto dto)
        {
            var role = new ApplicationRole(dto.Name)
            {
                Description = dto.Description
            };
            var result = await _roleManager.CreateAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            dto.Id = role.Id;
            return CreatedAtAction(nameof(GetRoleById), new { id = role.Id }, dto);
        }

        [HttpPut("roles/{id}")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> UpdateRole(Guid id, RoleDto dto)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null) return NotFound("Role not found");

            role.Name = dto.Name;
            role.NormalizedName = dto.Name.ToUpper();
            role.Description = dto.Description;

            var result = await _roleManager.UpdateAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpDelete("roles/{id}")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null) return NotFound("Role not found");

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpGet("permissions")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<IEnumerable<PermissionDto>>> GetPermissions()
        {
            var permissions = await _unitOfWork.Repository<ApplicationPermission>().GetAllAsync();
            return Ok(permissions.Select(p => new PermissionDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                FeatureGroup = p.FeatureGroup
            }));
        }

        [HttpPost("roles/{roleId}/permissions")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> AssignPermissions(Guid roleId, AssignPermissionsDto dto)
        {
            var role = await _roleManager.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null) return NotFound("Role not found");

            // Remove existing
            var existing = await _unitOfWork.Repository<RolePermission>()
                .FindAsync(rp => rp.RoleId == roleId);
            
            foreach(var ep in existing)
            {
                _unitOfWork.Repository<RolePermission>().Remove(ep);
            }

            // Add new
            foreach (var pId in dto.PermissionIds)
            {
                await _unitOfWork.Repository<RolePermission>().AddAsync(new RolePermission { RoleId = roleId, PermissionId = pId });
            }

            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpGet("users")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<IEnumerable<UserManagementDto>>> GetUsers()
        {
            var users = await _userManager.Users
                .Include(u => u.Company)
                .Include(u => u.Provider)
                .Include(u => u.Branch)
                .ToListAsync();

            var result = new List<UserManagementDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new UserManagementDto
                {
                    Id = user.Id,
                    Username = user.UserName!,
                    Email = user.Email!,
                    Roles = roles.ToList(),
                    CompanyId = user.CompanyId,
                    CompanyName = user.Company?.LegalName,
                    ProviderId = user.ProviderId,
                    ProviderName = user.Provider?.LegalName,
                    BranchId = user.BranchId,
                    BranchName = user.Branch?.Address
                });
            }

            return Ok(result);
        }

        [HttpGet("users/{userId}")]
        [HasPermission("User.Manage")]
        public async Task<ActionResult<UserManagementDto>> GetUserDetails(Guid userId)
        {
            var user = await _userManager.Users
                .Include(u => u.Company)
                .Include(u => u.Provider)
                .Include(u => u.Branch)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound("User not found");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new UserManagementDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Roles = roles.ToList(),
                CompanyId = user.CompanyId,
                CompanyName = user.Company?.LegalName,
                ProviderId = user.ProviderId,
                ProviderName = user.Provider?.LegalName,
                BranchId = user.BranchId,
                BranchName = user.Branch?.Address
            });
        }

        [HttpPut("users/{userId}")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> UpdateUser(Guid userId, [FromBody] UpdateUserDto dto)
        {
            var result = await _authService.UpdateUserAsync(userId, dto);
            if (!result) return BadRequest("Could not update user. Ensure user exists and data is valid.");
            return NoContent();
        }

        [HttpPost("users/{userId}/role")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> AssignRole(Guid userId, AssignRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound("User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, dto.RoleName);

            return NoContent();
        }

        [HttpDelete("users/{userId}")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound("User not found");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest("Could not delete user.");

            return NoContent();
        }

        [HttpPost("users/{userId}/reset-password")]
        [HasPermission("User.Manage")]
        public async Task<IActionResult> ResetPassword(Guid userId, ResetPasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return NotFound("User not found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

            if (!result.Succeeded) return BadRequest("Could not reset password.");

            return NoContent();
        }
    }
}
