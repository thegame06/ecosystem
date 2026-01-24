using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using SaaS.Application.Interfaces;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class WhatsAppHealthCheckService : BackgroundService
{
    private readonly ILogger<WhatsAppHealthCheckService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

    public WhatsAppHealthCheckService(
        ILogger<WhatsAppHealthCheckService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WhatsApp Self-Healing Service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunHealthCheckAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during WhatsApp health check.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task RunHealthCheckAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var companyRepository = scope.ServiceProvider.GetRequiredService<ICompanyRepository>();
        var byonProvider = scope.ServiceProvider.GetRequiredService<WhatsAppByonProvider>();

        // 1. Get all active companies using Unofficial provider
        var companies = await companyRepository.GetAllAsync(); // TODO: Add filter to repo for efficiency
        
        var activeCompanies = companies
            .Where(c => c.WhatsAppSettings != null 
                     && c.WhatsAppSettings.IsActive 
                     && c.WhatsAppSettings.ProviderType == WhatsAppProviderType.Unofficial)
            .ToList();

        if (!activeCompanies.Any()) return;

        _logger.LogInformation("Running WhatsApp Health Check for {Count} active companies...", activeCompanies.Count);

        foreach (var company in activeCompanies)
        {
            if (stoppingToken.IsCancellationRequested) break;

            try 
            {
                // Self-Healing Strategy:
                // Instead of checking if it's broken (which requires another API call),
                // we aggressively enforce the webhook configuration periodically.
                // This is idempotent and ensures it's always correct.
                
                var instanceName = $"comp_{company.Id}";
                await byonProvider.SetWebhookAsync(instanceName);
                
                // _logger.LogInformation("Webhook enforced for {Instance}", instanceName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to heal webhook for company {CompanyId}", company.Id);
            }
        }
    }
}
