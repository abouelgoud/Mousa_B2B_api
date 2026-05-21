namespace B2B_V2.Application.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // SuperAdministrator, Administrator, Company, HealthCareProvider
        public Guid? CompanyId { get; set; }
        public Guid? ProviderId { get; set; }
    }
}
