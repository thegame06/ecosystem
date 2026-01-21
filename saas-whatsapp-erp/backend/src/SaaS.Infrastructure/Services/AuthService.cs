using SaaS.Application.DTOs.Auth;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator; // Fixed missing field
    private readonly IPlanService _planService;

    public AuthService(
        ICompanyRepository companyRepository,
        IUserRepository userRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IPlanService planService)
    {
        _companyRepository = companyRepository;
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _planService = planService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validar que el email no exista
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already registered");
        }

        // Crear la empresa
        var company = new Company
        {
            Name = request.CompanyName,
            Country = request.Country,
            TaxRate = request.Country == "NI" ? 0.15m : 0.15m, // Ajustar según país
            InvoiceSequence = 1,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        company = await _companyRepository.CreateAsync(company);

        // Crear el usuario Owner
        var user = new User
        {
            CompanyId = company.Id,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = UserRoles.Owner,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user = await _userRepository.CreateAsync(user);

        // Registrar consumo inicial de usuario
        await _planService.TrackConsumptionAsync(company.Id, "users");

        // Generar token
        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.CompanyId, user.Email, user.Role);

        return new AuthResponse(
            token,
            new UserInfo(user.Id, user.CompanyId, user.Email, user.FirstName, user.LastName, user.Role)
        );
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Buscar usuario por email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verificar password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verificar que el usuario esté activo
        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("User is inactive");
        }

        // Generar token
        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.CompanyId, user.Email, user.Role);

        return new AuthResponse(
            token,
            new UserInfo(user.Id, user.CompanyId, user.Email, user.FirstName, user.LastName, user.Role)
        );
    }

    public async Task<UserInfo?> GetCurrentUserAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        return new UserInfo(user.Id, user.CompanyId, user.Email, user.FirstName, user.LastName, user.Role);
    }
}
