namespace B2B_V2.Domain.Enums
{
    public enum ProviderAssignmentMode
    {
        SinglePreferred,
        Automatic,
        MultiProvider
    }

    public enum LabSetup
    {
        Internal,
        External
    }

    public enum RequestStatus
    {
        Pending,                // on creation
        Accepted,               // accept the case
        CheckedIn,              // check-in candidate
        ExaminationStarted,     // start examination
        AuthorizedSubmitted,    // Authorize & Submit
        ReturnedForMoreTests,   // Return for more Tests
        Rejected,
        Closed
    }

    public enum NotificationType
    {
        SMS,
        Email,
        InApp
    }

    public enum ReportType
    {
        FIT_UNFIT_CERTIFICATE,
        LAB_RESULTS,
        IMAGING_REPORTS,
        PHYSICIAN_SUMMARY
    }

    public enum MedicalAssessment
    {
        FIT,
        NOT_FIT,
        CONDITIONALLY_FIT
    }

    public enum ApprovalStatus
    {
        Pending,
        Approved,
        ClarificationRequested,
        RetestingRequested
    }

    public enum AuditAction
    {
        Create,
        Update,
        Delete,
        StatusChange,
        Login,
        Logout
    }
}
