using B2B_V2.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace B2B_V2.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Provider> Providers { get; set; }
        public DbSet<ProviderBranch> ProviderBranches { get; set; }
        public DbSet<ProviderTier> ProviderTiers { get; set; }
        public DbSet<Package> Packages { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<CandidateAttachment> CandidateAttachments { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<PackageService> PackageServices { get; set; }
        public DbSet<ProviderService> ProviderServices { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<RequestDocument> RequestDocuments { get; set; }
        public DbSet<RequestStatusLog> RequestStatusLogs { get; set; }
        public DbSet<RequestAdditionalService> RequestAdditionalServices { get; set; }
        public DbSet<MedicalReport> MedicalReports { get; set; }
        public DbSet<MedicalResult> MedicalResults { get; set; }
        public DbSet<FinancialRecord> FinancialRecords { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Theme> Themes { get; set; }
        public DbSet<UserSetting> UserSettings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<BankAccount> BankAccounts { get; set; }
        public DbSet<AIModelConfiguration> AIModelConfigurations { get; set; }
        public DbSet<ApplicationPermission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Composite Keys for Junction Tables
            builder.Entity<PackageService>()
                .HasKey(ps => new { ps.PackageId, ps.ServiceId });

            builder.Entity<ProviderService>()
                .HasKey(ps => new { ps.ProviderId, ps.ServiceId });

            builder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            builder.Entity<Provider>()
                .HasOne(p => p.BankAccount)
                .WithOne(b => b.Provider)
                .HasForeignKey<BankAccount>(b => b.ProviderId);

            // Relationships
            builder.Entity<PackageService>()
                .HasOne(ps => ps.Package)
                .WithMany(p => p.PackageServices)
                .HasForeignKey(ps => ps.PackageId);

            // Better way for many-to-many
            builder.Entity<PackageService>()
                .HasKey(ps => new { ps.PackageId, ps.ServiceId });

            builder.Entity<PackageService>()
                .HasOne(ps => ps.Package)
                .WithMany(p => p.PackageServices)
                .HasForeignKey(ps => ps.PackageId);

            builder.Entity<PackageService>()
                .HasOne(ps => ps.Service)
                .WithMany()
                .HasForeignKey(ps => ps.ServiceId);

            builder.Entity<ProviderService>()
                .HasOne(ps => ps.Provider)
                .WithMany()
                .HasForeignKey(ps => ps.ProviderId);

            builder.Entity<ProviderService>()
                .HasOne(ps => ps.Service)
                .WithMany()
                .HasForeignKey(ps => ps.ServiceId);

            builder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);

            builder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            // Unique Constraints
            builder.Entity<Company>()
                .HasIndex(c => c.CRNumber)
                .IsUnique();

            builder.Entity<Request>()
                .HasIndex(r => r.CaseID)
                .IsUnique();

            builder.Entity<UserSetting>()
                .HasIndex(u => u.UserId)
                .IsUnique();

            builder.Entity<Request>()
                .HasOne(r => r.MedicalResult)
                .WithOne(m => m.Request)
                .HasForeignKey<MedicalResult>(m => m.RequestId);

            // FinancialRecord Precision & Indexes
            builder.Entity<FinancialRecord>(entity =>
            {
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
                entity.Property(e => e.ProviderPayout).HasPrecision(18, 2);
                entity.Property(e => e.PlatformFee).HasPrecision(18, 2);
                entity.HasIndex(e => e.RequestId);
            });

            builder.Entity<Service>(entity =>
            {
                entity.Property(e => e.Price).HasPrecision(18, 2);
            });

            builder.Entity<ProviderService>(entity =>
            {
                entity.Property(e => e.Price).HasPrecision(18, 2);
            });

            builder.Entity<Package>(entity =>
            {
                entity.Property(e => e.Price).HasPrecision(18, 2);
            });

            builder.Entity<Provider>(entity =>
            {
                entity.Property(e => e.Latitude).HasPrecision(18, 10);
                entity.Property(e => e.Longitude).HasPrecision(18, 10);
            });

            builder.Entity<Company>(entity =>
            {
                entity.Property(e => e.Latitude).HasPrecision(18, 10);
                entity.Property(e => e.Longitude).HasPrecision(18, 10);
            });

            builder.Entity<MedicalResult>()
                .HasIndex(m => m.RequestId);
        }
    }
}
