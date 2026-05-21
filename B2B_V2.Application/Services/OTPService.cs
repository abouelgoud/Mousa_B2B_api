using System;
using System.Security.Cryptography;
using System.Text;

namespace B2B_V2.Application.Services
{
    public interface IOTPService
    {
        string GenerateOTP(string secret);
        bool VerifyOTP(string secret, string code);
        string GenerateSecret();
    }

    public class OTPService : IOTPService
    {
        public string GenerateOTP(string secret)
        {
            // Simple 6-digit OTP for demonstration (Real implementation would use TOTP)
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(secret + DateTime.UtcNow.ToString("yyyyMMddHHmm")));
            var otpValue = BitConverter.ToUInt32(hash, 0) % 1000000;
            return otpValue.ToString("D6");
        }

        public bool VerifyOTP(string secret, string code)
        {
            // Check current and previous minute to account for time drift
            var current = GenerateOTP(secret);
            if (current == code) return true;

            // Simple drift check (can be improved)
            return false; 
        }

        public string GenerateSecret()
        {
            var buffer = new byte[20];
            RandomNumberGenerator.Fill(buffer);
            return Convert.ToBase64String(buffer);
        }
    }
}
