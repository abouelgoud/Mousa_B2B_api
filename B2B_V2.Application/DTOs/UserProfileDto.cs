using System;

namespace B2B_V2.Application.DTOs
{
    public class UserProfileDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? ProfilePicturePath { get; set; }
    }
}
