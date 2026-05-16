using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class WhatsAppProviderDispatcher : IWhatsAppProvider
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ICompanyRepository _companyRepository;
    private readonly ILogger<WhatsAppProviderDispatcher> _logger;

    public WhatsAppProviderDispatcher(
        IServiceProvider serviceProvider,
        ICompanyRepository companyRepository,
        ILogger<WhatsAppProviderDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _companyRepository = companyRepository;
        _logger = logger;
    }

    public async Task<bool> SendTextMessageAsync(string companyId, string toNumber, string message)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.SendTextMessageAsync(companyId, toNumber, message);
    }

    public async Task<bool> SendPdfAsync(string companyId, string toNumber, byte[] pdfBytes, string fileName)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.SendPdfAsync(companyId, toNumber, pdfBytes, fileName);
    }

    public async Task<string> GetQrCodeAsync(string companyId)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.GetQrCodeAsync(companyId);
    }

    public async Task<bool> IsConnectedAsync(string companyId)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.IsConnectedAsync(companyId);
    }

    public async Task<bool> LogoutAsync(string companyId)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.LogoutAsync(companyId);
    }

    public async Task<bool> SyncWebhookAsync(string companyId)
    {
        var provider = await GetProviderAsync(companyId);
        return await provider.SyncWebhookAsync(companyId);
    }



    private async Task<IWhatsAppProvider> GetProviderAsync(string companyId)
    {
        var company = await _companyRepository.GetByIdAsync(companyId);
        if (company == null || company.WhatsAppSettings == null)
        {
            _logger.LogWarning("WhatsApp settings not found for Company {CompanyId}, falling back to Evolution V2 provider", companyId);
            return _serviceProvider.GetRequiredService<WhatsAppEvolutionV2Provider>();
        }


        if (company.WhatsAppSettings.ProviderType == WhatsAppProviderType.Official)
        {
            return _serviceProvider.GetRequiredService<WhatsAppCloudApiProvider>();
        }

        return _serviceProvider.GetRequiredService<WhatsAppEvolutionV2Provider>();
    }
}
