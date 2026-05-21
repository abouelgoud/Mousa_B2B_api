using B2B_V2.Application.DTOs;
using System.Threading.Tasks;

namespace B2B_V2.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<bool> UpdateUserAsync(Guid userId, UpdateUserDto userDto);
    }
}
