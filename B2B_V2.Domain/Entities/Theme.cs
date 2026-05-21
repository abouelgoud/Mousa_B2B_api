using B2B_V2.Domain.Common;

namespace B2B_V2.Domain.Entities
{
    public class Theme : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = string.Empty;
        public string SecondaryColor { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string TextColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public bool Default { get; set; }
    }
}
