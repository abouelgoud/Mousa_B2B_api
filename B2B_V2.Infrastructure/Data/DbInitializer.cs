using B2B_V2.Domain.Entities;
using B2B_V2.Domain.Enums;
using B2B_V2.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace B2B_V2.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
        {
            // context.Database.EnsureCreated(); // Use this if migrations are not working yet
            await context.Database.MigrateAsync();

            // Seed Roles
            string[] roles = { "SuperAdministrator", "Administrator", "Company", "HealthCareProvider" };
            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new ApplicationRole(roleName));
                }
            }

            // Seed SuperAdmin
            var adminEmail = "admin@b2bhealthcare.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    IsActive = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "SuperAdministrator");
                }
            }

            // Seed Permissions
            var permissions = new List<ApplicationPermission>
            {
                new ApplicationPermission { Name = "Dashboard.View", Description = "View main dashboard", FeatureGroup = "Dashboard" },
                new ApplicationPermission { Name = "AIDashboard.View", Description = "View AI-powered dashboard", FeatureGroup = "Dashboard" },
                new ApplicationPermission { Name = "Companies.View", Description = "View company lists and details", FeatureGroup = "Companies" },
                new ApplicationPermission { Name = "Companies.Manage", Description = "Create/Edit/Delete companies", FeatureGroup = "Companies" },
                new ApplicationPermission { Name = "Providers.View", Description = "View medical provider lists", FeatureGroup = "Providers" },
                new ApplicationPermission { Name = "Providers.Manage", Description = "Create/Edit/Delete providers", FeatureGroup = "Providers" },
                new ApplicationPermission { Name = "Packages.View", Description = "View medical packages", FeatureGroup = "Packages" },
                new ApplicationPermission { Name = "Packages.Manage", Description = "Manage medical screening packages", FeatureGroup = "Packages" },
                new ApplicationPermission { Name = "Services.View", Description = "View medical services", FeatureGroup = "Services" },
                new ApplicationPermission { Name = "Services.Manage", Description = "Manage individual medical services", FeatureGroup = "Services" },
                new ApplicationPermission { Name = "Requests.Create", Description = "Create new screening requests", FeatureGroup = "Requests" },
                new ApplicationPermission { Name = "Requests.View", Description = "View screening requests", FeatureGroup = "Requests" },
                new ApplicationPermission { Name = "Requests.Manage", Description = "Manage request status and assignments", FeatureGroup = "Requests" },
                new ApplicationPermission { Name = "Candidates.View", Description = "View company candidates", FeatureGroup = "Candidates" },
                new ApplicationPermission { Name = "Candidates.Manage", Description = "Manage company candidates", FeatureGroup = "Candidates" },
                new ApplicationPermission { Name = "Cases.View", Description = "View screening cases list", FeatureGroup = "Cases" },
                new ApplicationPermission { Name = "Cases.Queue", Description = "Access screening case queue", FeatureGroup = "Cases" },
                new ApplicationPermission { Name = "Cases.Details", Description = "View detailed case information", FeatureGroup = "Cases" },
                new ApplicationPermission { Name = "Reports.View", Description = "View platform reports", FeatureGroup = "Reports" },
                new ApplicationPermission { Name = "Reports.Financial", Description = "View financial reports", FeatureGroup = "Reports" },
                new ApplicationPermission { Name = "Admin.Review", Description = "Perform administrative reviews", FeatureGroup = "Admin" },
                new ApplicationPermission { Name = "Profile.Edit", Description = "Edit personal user profile", FeatureGroup = "Account" },
                new ApplicationPermission { Name = "Admin.Facilities", Description = "Manage medical facilities", FeatureGroup = "Admin" },
                new ApplicationPermission { Name = "Admin.Branches", Description = "Manage facility branches", FeatureGroup = "Admin" },
                new ApplicationPermission { Name = "User.Manage", Description = "Manage system users and roles", FeatureGroup = "Admin" },
                new ApplicationPermission { Name = "Analytics.View", Description = "View workforce health analytics", FeatureGroup = "Analytics" },
                new ApplicationPermission { Name = "Notification.View", Description = "View and interact with notifications", FeatureGroup = "Notifications" }
            };

            foreach (var p in permissions)
            {
                if (!await context.Permissions.AnyAsync(x => x.Name == p.Name))
                {
                    await context.Permissions.AddAsync(p);
                }
            }
            await context.SaveChangesAsync();

            // Refetch permissions from DB to get their IDs
            var allPermissions = await context.Permissions.ToListAsync();

            // Assign All Permissions to SuperAdministrator
            var superAdminRole = await roleManager.FindByNameAsync("SuperAdministrator");
            if (superAdminRole != null)
            {
                foreach (var p in allPermissions)
                {
                    if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == superAdminRole.Id && rp.PermissionId == p.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { RoleId = superAdminRole.Id, PermissionId = p.Id });
                    }
                }
            }

            // Assign Specific Permissions to Company Role
            var companyRole = await roleManager.FindByNameAsync("Company");
            if (companyRole != null)
            {
                var companyPermNames = new[] { 
                    "Dashboard.View", "AIDashboard.View", "Requests.Create", "Requests.View", 
                    "Candidates.View", "Candidates.Manage", "Profile.Edit", "Notification.View",
                    "Analytics.View", "Services.View", "Packages.View"
                };
                var companyPerms = allPermissions.Where(p => companyPermNames.Contains(p.Name));
                
                foreach (var p in companyPerms)
                {
                    if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == companyRole.Id && rp.PermissionId == p.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { RoleId = companyRole.Id, PermissionId = p.Id });
                    }
                }
            }

            // Assign Specific Permissions to HealthCareProvider Role
            var providerRole = await roleManager.FindByNameAsync("HealthCareProvider");
            if (providerRole != null)
            {
                var providerPermNames = new[] { 
                    "Dashboard.View", "AIDashboard.View", "Requests.View", "Requests.Manage", 
                    "Cases.View", "Cases.Queue", "Cases.Details", "Profile.Edit", "Notification.View",
                    "Services.View", "Packages.View", "Analytics.View"
                };
                var providerPerms = allPermissions.Where(p => providerPermNames.Contains(p.Name));
                
                foreach (var p in providerPerms)
                {
                    if (!await context.RolePermissions.AnyAsync(rp => rp.RoleId == providerRole.Id && rp.PermissionId == p.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { RoleId = providerRole.Id, PermissionId = p.Id });
                    }
                }
            }

            await context.SaveChangesAsync();

            // Seed Provider Tiers
            if (!context.ProviderTiers.Any())
            {
                context.ProviderTiers.AddRange(new List<ProviderTier>
                {
                    new ProviderTier { Name = "Standard", Description = "Basic visibility" },
                    new ProviderTier { Name = "Premium", Description = "Enhanced visibility and priority" },
                    new ProviderTier { Name = "Enterprise", Description = "Full partnership features" }
                });
                await context.SaveChangesAsync();
            }

            // Seed Themes
            if (!context.Themes.Any())
            {
                context.Themes.AddRange(new List<Theme>
                {
                    new Theme { Name = "Outlook Blue", PrimaryColor = "#0078d4", BackgroundColor = "#ffffff", Default = true },
                    new Theme { Name = "Outlook Dark", PrimaryColor = "#201f1e", BackgroundColor = "#11100f", TextColor = "#ffffff" },
                    new Theme { Name = "Forest Green", PrimaryColor = "#107c10", BackgroundColor = "#ffffff" },
                    new Theme { Name = "Sunset Orange", PrimaryColor = "#d83b01", BackgroundColor = "#ffffff" },
                    new Theme { Name = "Royal Purple", PrimaryColor = "#5c2d91", BackgroundColor = "#ffffff" },
                    new Theme { Name = "Midnight Black", PrimaryColor = "#000000", BackgroundColor = "#ffffff" }
                });
                await context.SaveChangesAsync();
            }
            // Seed Test Company
            var companyEmail = "company@b2bhealthcare.com";
            var companyUser = await userManager.FindByEmailAsync(companyEmail);
            Company testCompany;
            if (!context.Companies.Any())
            {
                testCompany = new Company
                {
                    LegalName = "Global Tech Corp",
                    CRNumber = "1234567890",
                    CRCertificatePath = "certs/gtc_cr.pdf",
                    HeadOfficeAddress = "Tech Plaza, Riyadh",
                    CompanySize = 500,
                    TotalEmployees = 1200,
                    BusinessActivity = "Software Development",
                    EstimatedMonthlyScreeningVolume = 50,
                    DesignatedContactPersonId = Guid.NewGuid()
                };
                context.Companies.Add(testCompany);
                await context.SaveChangesAsync();
            }
            else
            {
                testCompany = await context.Companies.FirstAsync();
            }

            // Ensure Company User exists and is linked
            if (companyUser == null)
            {
                companyUser = new ApplicationUser
                {
                    UserName = companyEmail,
                    Email = companyEmail,
                    EmailConfirmed = true,
                    IsActive = true,
                    CompanyId = testCompany.Id
                };
                var result = await userManager.CreateAsync(companyUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(companyUser, "Company");
                }
            }
            else if (companyUser.CompanyId == null)
            {
                companyUser.CompanyId = testCompany.Id;
                await userManager.UpdateAsync(companyUser);
            }

            // Seed Candidates for the Company
            if (!context.Candidates.Any())
            {
                context.Candidates.AddRange(new List<Candidate>
                {
                    new Candidate { FullName = "Ahmed Ali", NationalID = "1234567891", MobileNumber = "0501234567", Gender = "Male", Position = "Software Engineer", BranchLocation = "Riyadh", CompanyId = testCompany.Id },
                    new Candidate { FullName = "Sarah Smith", NationalID = "1234567892", MobileNumber = "0507654321", Gender = "Female", Position = "HR Manager", BranchLocation = "Jeddah", CompanyId = testCompany.Id },
                    new Candidate { FullName = "John Doe", NationalID = "1234567893", MobileNumber = "0509876543", Gender = "Male", Position = "Accountant", BranchLocation = "Dammam", CompanyId = testCompany.Id }
                });
                await context.SaveChangesAsync();
            }

            // Seed Test Package
            if (!context.Packages.Any())
            {
                var testPackage = new Package
                {
                    Name = "Basic Health Screening",
                    Description = "Standard medical examination package",
                    Price = 500.00m
                };
                context.Packages.Add(testPackage);
                await context.SaveChangesAsync();
            }

            // Seed Test Screening Requests
            if (!context.Requests.Any())
            {
                var candidates = await context.Candidates.ToListAsync();
                var package = await context.Packages.FirstOrDefaultAsync(p => p.Name == "Basic Health Screening");
                
                // Fetch company if needed, though we can use candidate.CompanyId if loaded, but safer to get the main one
                var company = await context.Companies.FirstOrDefaultAsync(c => c.LegalName == "Global Tech Corp");

                if (candidates.Any() && package != null && company != null)
                {
                    var requests = new List<Request>();
                    var statuses = new[] { RequestStatus.Pending, RequestStatus.ExaminationStarted, RequestStatus.AuthorizedSubmitted };
                    
                    for (int i = 0; i < candidates.Count; i++)
                    {
                        requests.Add(new Request
                        {
                            CaseID = $"B2B-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                            CompanyId = company.Id,
                            CandidateId = candidates[i].Id,
                            PackageId = package.Id,
                            Status = statuses[i % statuses.Length],
                            ExpectedVisitDate = DateTime.UtcNow.AddDays(i + 1),
                            ScreeningBatchId = Guid.NewGuid()
                        });
                    }
                    
                    context.Requests.AddRange(requests);
                    await context.SaveChangesAsync();
                }
            }

            // Seed Test Provider
            var providerEmail = "provider@b2bhealthcare.com";
            var providerUser = await userManager.FindByEmailAsync(providerEmail);
            Provider testProvider;
            if (!context.Providers.Any())
            {
                var tier = await context.ProviderTiers.FirstAsync();
                testProvider = new Provider
                {
                    LegalName = "MediCare Hospital",
                    CRCertificatePath = "certs/medicare_cr.pdf",
                    MOHLicensePath = "certs/medicare_moh.pdf",
                    PrimaryContactPersonId = Guid.NewGuid(),
                    TierId = tier.Id,
                    LabSetup = LabSetup.Internal,
                    EstimatedDailyOperationalCapacity = 200,
                    BankAccountId = Guid.NewGuid() // Placeholder
                };
                context.Providers.Add(testProvider);
                await context.SaveChangesAsync();
            }
            else
            {
                testProvider = await context.Providers.FirstAsync();
            }

            // Ensure Provider User exists and is linked
            if (providerUser == null)
            {
                providerUser = new ApplicationUser
                {
                    UserName = providerEmail,
                    Email = providerEmail,
                    EmailConfirmed = true,
                    IsActive = true,
                    ProviderId = testProvider.Id
                };
                var result = await userManager.CreateAsync(providerUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(providerUser, "HealthCareProvider");
                }
            }
            else if (providerUser.ProviderId == null)
            {
                providerUser.ProviderId = testProvider.Id;
                await userManager.UpdateAsync(providerUser);
            }

            // Seed Assigned Requests for Provider Worklist
            if (!context.Requests.Any(r => r.AssignedProviderId == testProvider.Id))
            {
                var candidates = await context.Candidates.ToListAsync();
                var package = await context.Packages.FirstAsync();
                var company = await context.Companies.FirstAsync();

                if (candidates.Any())
                {
                    var assignedRequests = new List<Request>();
                    int count = Math.Min(candidates.Count, 2);
                    for (int i = 0; i < count; i++)
                    {
                        assignedRequests.Add(new Request
                        {
                            CaseID = $"B2B-PROV-{DateTime.UtcNow:yyyyMMdd}-00{i + 1}",
                            CompanyId = company.Id,
                            CandidateId = candidates[i].Id,
                            PackageId = package.Id,
                            Status = RequestStatus.Accepted,
                            AssignedProviderId = testProvider.Id,
                            ExpectedVisitDate = DateTime.UtcNow.AddDays(i + 1)
                        });
                    }

                    context.Requests.AddRange(assignedRequests);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
