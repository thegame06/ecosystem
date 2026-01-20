namespace SaaS.Application.DTOs.Auth;

public record AuthResponse(
    string Token,
    UserInfo User
);

public record UserInfo(
    string Id,
    string CompanyId,
    string Email,
    string FirstName,
    string LastName,
    string Role
);
