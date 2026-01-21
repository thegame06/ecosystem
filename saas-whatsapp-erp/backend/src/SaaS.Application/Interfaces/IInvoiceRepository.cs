using SaaS.Domain.Documents;

namespace SaaS.Application.Interfaces;

public interface IInvoiceRepository
{
    Task<Invoice> CreateAsync(Invoice invoice);
    Task<Invoice?> GetByIdAsync(string id);
    Task<List<Invoice>> GetByCompanyIdAsync(string companyId);
    IQueryable<Invoice> GetQueryable(string companyId);
    Task<Invoice?> GetBySaleIdAsync(string saleId);
    Task<Invoice?> GetByNumberAsync(string companyId, string number);
    Task<Invoice> UpdateAsync(Invoice invoice);
}
