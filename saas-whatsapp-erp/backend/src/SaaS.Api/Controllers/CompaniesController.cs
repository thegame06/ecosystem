using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.SaaS;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUsageCountersRepository _usageRepository;
    private readonly IWhatsAppProvider _whatsAppProvider;

    public CompaniesController(
        ICompanyRepository companyRepository,
        IUsageCountersRepository usageRepository,
        IWhatsAppProvider whatsAppProvider)
    {
        _companyRepository = companyRepository;
        _usageRepository = usageRepository;
        _whatsAppProvider = whatsAppProvider;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    [HttpGet]
    public async Task<ActionResult<Company>> Get()
    {
        return await GetMe();
    }

    [HttpGet("me")]
    public async Task<ActionResult<Company>> GetMe()
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpGet("usage")]
    public async Task<ActionResult> GetUsage()
    {
        var period = DateTime.UtcNow.ToString("yyyy-MM");
        var usage = await _usageRepository.GetCurrentAsync(GetCompanyId(), period);

        if (usage == null)
        {
            return Ok(new
            {
                messagesUsed = 0,
                conversationsUsed = 0,
                invoicesUsed = 0,
                usersUsed = 0
            });
        }

        return Ok(usage);
    }

    [HttpGet("limits")]
    public async Task<ActionResult> GetLimits()
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();

        var limits = PlanLimits.GetLimits(company.Plan);
        return Ok(limits);
    }

    [HttpPut("plan")]
    public async Task<ActionResult> UpdatePlan([FromBody] SaaS.Domain.Enums.PlanType plan)
    {
        await _companyRepository.UpdatePlanAsync(GetCompanyId(), plan);
        return Ok(new { message = $"Plan actualizado a {plan}" });
    }

    [HttpPut("me")]
    public async Task<ActionResult> UpdateMe([FromBody] Company company)
    {
        var existing = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (existing == null) return NotFound();

        // Only allow updating certain fields
        existing.Name = company.Name;
        existing.Country = company.Country;
        existing.TaxRate = company.TaxRate;
        existing.IsTaxEnabled = company.IsTaxEnabled;
        existing.CurrencySymbol = company.CurrencySymbol;
        existing.WhatsAppSettings = company.WhatsAppSettings;
        existing.UpdatedAt = DateTime.UtcNow;

        await _companyRepository.UpdateAsync(existing);
        return Ok(existing);
    }

    /// <summary>
    /// GET /api/companies/whatsapp-settings
    /// Obtiene la configuración de WhatsApp de la empresa
    /// </summary>
    [HttpGet("whatsapp-settings")]
    public async Task<ActionResult<WhatsAppSettings>> GetWhatsAppSettings()
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();

        if (company.WhatsAppSettings == null)
        {
            return NotFound(new { message = "WhatsApp settings not configured" });
        }

        return Ok(company.WhatsAppSettings);
    }

    /// <summary>
    /// POST /api/companies/whatsapp-settings
    /// Crea la configuración inicial de WhatsApp
    /// </summary>
    [HttpPost("whatsapp-settings")]
    public async Task<ActionResult> CreateWhatsAppSettings([FromBody] WhatsAppSettings settings)
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();

        // Validaciones
        if (string.IsNullOrWhiteSpace(settings.PhoneNumberId))
            return BadRequest(new { message = "PhoneNumberId is required" });

        if (string.IsNullOrWhiteSpace(settings.AccessToken))
            return BadRequest(new { message = "AccessToken is required" });

        // Solo permitir un settings activo por empresa
        if (company.WhatsAppSettings != null)
        {
            return BadRequest(new { message = "WhatsApp settings already exist. Use PUT to update." });
        }

        settings.CreatedAt = DateTime.UtcNow;
        settings.UpdatedAt = DateTime.UtcNow;

        company.WhatsAppSettings = settings;
        company.UpdatedAt = DateTime.UtcNow;

        await _companyRepository.UpdateAsync(company);
        return Ok(company.WhatsAppSettings);
    }

    /// <summary>
    /// PUT /api/companies/whatsapp-settings
    /// Actualiza la configuración de WhatsApp existente
    /// </summary>
    [HttpPut("whatsapp-settings")]
    public async Task<ActionResult> UpdateWhatsAppSettings([FromBody] WhatsAppSettings settings)
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();

        if (company.WhatsAppSettings == null)
        {
            return NotFound(new { message = "WhatsApp settings not found. Use POST to create." });
        }

        // Validaciones
        if (string.IsNullOrWhiteSpace(settings.PhoneNumberId))
            return BadRequest(new { message = "PhoneNumberId is required" });

        if (string.IsNullOrWhiteSpace(settings.AccessToken))
            return BadRequest(new { message = "AccessToken is required" });

        // Mantener fecha de creación original
        settings.CreatedAt = company.WhatsAppSettings.CreatedAt;
        settings.UpdatedAt = DateTime.UtcNow;

        company.WhatsAppSettings = settings;
        company.UpdatedAt = DateTime.UtcNow;

        await _companyRepository.UpdateAsync(company);
        return Ok(company.WhatsAppSettings);
    }

    [HttpGet("whatsapp-qr")]
    public async Task<ActionResult> GetWhatsAppQr()
    {
        var qrBase64 = await _whatsAppProvider.GetQrCodeAsync(GetCompanyId());
        if (string.IsNullOrEmpty(qrBase64))
        {
            return BadRequest(new { message = "Could not generate QR. Verify WhatsApp Engine is running." });
        }
        return Ok(new { qrCode = qrBase64 });
    }

    [HttpPost("whatsapp-check")]
    public async Task<ActionResult> CheckWhatsAppStatus()
    {
        var companyId = GetCompanyId();
        var isConnected = await _whatsAppProvider.IsConnectedAsync(companyId);

        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company != null && company.WhatsAppSettings != null)
        {
            if (company.WhatsAppSettings.IsActive != isConnected)
            {
                company.WhatsAppSettings.IsActive = isConnected;
                await _companyRepository.UpdateAsync(company);
            }
        }

        return Ok(new { isActive = isConnected });
    }

    [HttpDelete("whatsapp-logout")]
    public async Task<ActionResult> LogoutWhatsApp()
    {
        var companyId = GetCompanyId();
        await _whatsAppProvider.LogoutAsync(companyId);

        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company != null && company.WhatsAppSettings != null)
        {
            company.WhatsAppSettings.IsActive = false;
            await _companyRepository.UpdateAsync(company);
        }

        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost("whatsapp-sync")]
    public async Task<ActionResult> SyncWhatsApp()
    {
        var companyId = GetCompanyId();
        await _whatsAppProvider.SyncWebhookAsync(companyId);
        return Ok(new { message = "WhatsApp sync triggered." });
    }
}

