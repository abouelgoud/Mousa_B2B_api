using B2B_V2.Domain.Common;
using System;

namespace B2B_V2.Domain.Entities
{
    public class UserSetting : BaseEntity
    {
        public Guid UserId { get; set; }
        public Guid? PreferredThemeId { get; set; }
        public Theme? PreferredTheme { get; set; }
    }
}
