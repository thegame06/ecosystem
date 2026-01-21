using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IWhatsAppNumberRepository
{
    Task<WhatsAppNumber?> GetActiveByCompanyIdAsync(string companyId);
    Task CreateAsync(WhatsAppNumber number);
}
