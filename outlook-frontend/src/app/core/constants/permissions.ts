export const AppPermissions = {
    Dashboard: {
        View: 'Dashboard.View',
        AIView: 'AIDashboard.View'
    },
    Companies: {
        View: 'Companies.View',
        Manage: 'Companies.Manage'
    },
    Providers: {
        View: 'Providers.View',
        Manage: 'Providers.Manage'
    },
    Packages: {
        Manage: 'Packages.Manage'
    },
    Services: {
        Manage: 'Services.Manage'
    },
    Requests: {
        Create: 'Requests.Create',
        View: 'Requests.View',
        Manage: 'Requests.Manage'
    },
    Candidates: {
        Manage: 'Candidates.Manage'
    },
    Cases: {
        Queue: 'Cases.Queue',
        Details: 'Cases.Details'
    },
    Reports: {
        Financial: 'Reports.Financial'
    },
    Admin: {
        Review: 'Admin.Review',
        ManageUsers: 'User.Manage',
        Security: 'Admin.Security'
    },
    Account: {
        ProfileEdit: 'Profile.Edit'
    },
    Notifications: {
        View: 'Notification.View'
    }
} as const;

export type PermissionType = typeof AppPermissions[keyof typeof AppPermissions][keyof typeof AppPermissions[keyof typeof AppPermissions]];
