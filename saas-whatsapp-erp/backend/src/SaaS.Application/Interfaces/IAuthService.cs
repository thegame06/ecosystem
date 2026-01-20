using SaaS.Application.DTOs.Auth;

namespace SaaS.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserInfo?> GetCurrentUserAsync(string userId);
}
