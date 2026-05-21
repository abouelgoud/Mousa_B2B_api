using B2B_V2.Application.DTOs;
using B2B_V2.Application.Interfaces;
using B2B_V2.Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace B2B_V2.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IOTPService _otpService;

        public AuthController(IAuthService authService, IOTPService otpService)
        {
            _authService = authService;
            _otpService = otpService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
                return Unauthorized(new { message = "Invalid email or password" });

            // For demonstration, we return the result immediately. 
            // In a real 2FA flow, we would generate a temp token and send OTP.
            return Ok(result);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpVerificationDto otpDto)
        {
            // Simplified OTP verification logic
            var isValid = _otpService.VerifyOTP("secret_placeholder", otpDto.Code);
            if (!isValid) return BadRequest(new { message = "Invalid OTP code" });

            return Ok(new { message = "OTP verified successfully" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            if (!result)
                return BadRequest(new { message = "Registration failed" });

            return Ok(new { message = "User registered successfully" });
        }
    }
}
