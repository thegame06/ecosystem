namespace SaaS.Application.DTOs.Auth;

public record RegisterRequest(
    string CompanyName,
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Country = "NI"
);
