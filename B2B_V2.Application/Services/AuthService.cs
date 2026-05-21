using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace B2B_V2.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IConfiguration configuration,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _unitOfWork = unitOfWork;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .Include(u => u.Branch)
                .Include(u => u.Provider)
                    .ThenInclude(p => p!.Branches)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return null;

            var roles = await _userManager.GetRolesAsync(user);
            var permissions = await GetUserPermissionsAsync(roles);
            var token = GenerateJwtToken(user, roles, permissions);

            return new AuthResponseDto
            {
                Token = token,
                UserId = user.Id,
                Username = user.UserName!,
                Roles = roles.ToList(),
                Permissions = permissions,
                CompanyId = user.CompanyId,
                ProviderId = user.ProviderId,
                BranchId = user.BranchId,
                BranchName = user.Branch?.Address,
                AvailableBranches = user.Provider?.Branches?.Select(b => new BranchDto
                {
                    Id = b.Id,
                    Address = b.Address
                }).ToList() ?? new List<BranchDto>()
            };
        }

        private async Task<List<string>> GetUserPermissionsAsync(IList<string> roles)
        {
            if (!roles.Any()) return new List<string>();

            var rolePermissions = await _unitOfWork.Repository<RolePermission>()
                .GetAllAsync(rp => rp.Permission!, rp => rp.Role!);

            return rolePermissions
                .Where(rp => roles.Contains(rp.Role.Name!))
                .Select(rp => rp.Permission.Name)
                .Distinct()
                .ToList();
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                CompanyId = registerDto.CompanyId,
                ProviderId = registerDto.ProviderId
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return false;

            if (!string.IsNullOrEmpty(registerDto.Role))
            {
                if (!await _roleManager.RoleExistsAsync(registerDto.Role))
                {
                    await _roleManager.CreateAsync(new ApplicationRole(registerDto.Role));
                }
                await _userManager.AddToRoleAsync(user, registerDto.Role);
            }

            return true;
        }

        public async Task<bool> UpdateUserAsync(Guid userId, UpdateUserDto userDto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return false;

            user.Email = userDto.Email;
            user.UserName = userDto.Username;
            user.CompanyId = userDto.CompanyId;
            user.ProviderId = userDto.ProviderId;
            user.BranchId = userDto.BranchId;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return false;

            // Sync Roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToRemove = currentRoles.Except(userDto.Roles).ToList();
            var rolesToAdd = userDto.Roles.Except(currentRoles).ToList();

            if (rolesToRemove.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            }

            if (rolesToAdd.Any())
            {
                foreach (var role in rolesToAdd)
                {
                    if (!await _roleManager.RoleExistsAsync(role))
                    {
                        await _roleManager.CreateAsync(new ApplicationRole(role));
                    }
                }
                await _userManager.AddToRolesAsync(user, rolesToAdd);
            }

            return true;
        }

        private string GenerateJwtToken(ApplicationUser user, IList<string> roles, List<string> permissions)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim("CompanyId", user.CompanyId?.ToString() ?? ""),
                new Claim("ProviderId", user.ProviderId?.ToString() ?? "")
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            foreach (var permission in permissions)
            {
                claims.Add(new Claim("Permission", permission));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["DurationInMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
