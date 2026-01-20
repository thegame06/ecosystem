namespace SaaS.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(string userId, string companyId, string email, string role);
}
