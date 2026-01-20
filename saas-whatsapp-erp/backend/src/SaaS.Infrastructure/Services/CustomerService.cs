using SaaS.Application.DTOs.Customers;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;

namespace SaaS.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly ISaleRepository _saleRepository;
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IConversationRepository _conversationRepository;

    public CustomerService(
        ICustomerRepository customerRepository,
        ISaleRepository saleRepository,
        IInvoiceRepository invoiceRepository,
        IConversationRepository conversationRepository)
    {
        _customerRepository = customerRepository;
        _saleRepository = saleRepository;
        _invoiceRepository = invoiceRepository;
        _conversationRepository = conversationRepository;
    }

    public async Task<List<CustomerResponse>> GetAllAsync(string companyId)
    {
        var customers = await _customerRepository.GetByCompanyIdAsync(companyId);
        // Filter out inactive if soft delete is implemented via IsActive
        return customers.Where(c => c.IsActive).Select(MapToResponse).ToList();
    }

    public async Task<CustomerResponse?> GetByIdAsync(string id, string companyId)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null || customer.CompanyId != companyId || !customer.IsActive)
            return null;

        return MapToResponse(customer);
    }

    public async Task<CustomerResponse> CreateAsync(CreateCustomerRequest request, string companyId)
    {
        // Validar teléfono único por empresa
        var existingCustomer = await _customerRepository.GetByPhoneAsync(companyId, request.Phone);
        if (existingCustomer != null && existingCustomer.IsActive)
        {
             throw new InvalidOperationException($"A customer with phone {request.Phone} already exists.");
        }

        var customer = new Customer
        {
            CompanyId = companyId,
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            TaxId = request.TaxId,
            Address = request.Address,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true,
            CurrentState = Domain.Enums.CommercialState.LEAD
        };

        var created = await _customerRepository.CreateAsync(customer);
        return MapToResponse(created);
    }

    public async Task<CustomerResponse?> UpdateAsync(string id, UpdateCustomerRequest request, string companyId)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null || customer.CompanyId != companyId || !customer.IsActive)
            return null;

        // Si cambia el teléfono, validar que no exista
        if (customer.Phone != request.Phone)
        {
            var existing = await _customerRepository.GetByPhoneAsync(companyId, request.Phone);
             if (existing != null && existing.Id != id && existing.IsActive)
            {
                 throw new InvalidOperationException($"A customer with phone {request.Phone} already exists.");
            }
        }

        customer.Name = request.Name;
        customer.Phone = request.Phone;
        customer.Email = request.Email;
        customer.TaxId = request.TaxId;
        customer.Address = request.Address;
        if(request.CurrentState.HasValue)
        {
            customer.CurrentState = request.CurrentState.Value;
        }
        customer.UpdatedAt = DateTime.UtcNow;

        var updated = await _customerRepository.UpdateAsync(customer);
        return MapToResponse(updated);
    }

    public async Task<bool> DeleteAsync(string id, string companyId)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null || customer.CompanyId != companyId)
            return false;

        // Soft delete
        customer.IsActive = false;
        customer.UpdatedAt = DateTime.UtcNow;
        await _customerRepository.UpdateAsync(customer);
        
        return true;
    }

    public async Task<CustomerDetailResponse?> GetDetailAsync(string id, string companyId)
    {
        var customer = await _customerRepository.GetByIdAsync(id);
        if (customer == null || customer.CompanyId != companyId || !customer.IsActive)
            return null;

        var response = MapToDetailResponse(customer);

        // TODO: Populate lists when repositories support GetByCustomerId
        // For now returning empty lists or need to add methods to repositories
        
        // response.Sales = await _saleRepository.GetByCustomerIdAsync(id);
        // response.Invoices = ...
        // response.Conversations = ...

        return response;
    }

    public async Task<List<SaleResponse>> GetSalesByCustomerAsync(string customerId, string companyId)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null || customer.CompanyId != companyId)
            return new List<SaleResponse>();

        var sales = await _saleRepository.GetByCustomerIdAsync(companyId, customerId);
        return sales.Select(MapSaleToResponse).ToList();
    }

    private SaleResponse MapSaleToResponse(Sale sale)
    {
        return new SaleResponse
        {
            Id = sale.Id,
            CompanyId = sale.CompanyId,
            CustomerId = sale.CustomerId,
            Number = sale.Number,
            Date = sale.Date,
            Subtotal = sale.Subtotal,
            TaxAmount = sale.TaxAmount,
            Total = sale.Total,
            Status = sale.State.ToString(),
            Items = sale.Items.Select(i => new SaleItemResponse
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TaxRate = i.TaxRate,
                Subtotal = i.Subtotal,
                Total = i.Total
            }).ToList()
        };
    }

    private CustomerResponse MapToResponse(Customer customer)
    {
        return new CustomerResponse
        {
            Id = customer.Id,
            CompanyId = customer.CompanyId,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            TaxId = customer.TaxId,
            Address = customer.Address,
            CurrentState = customer.CurrentState
        };
    }

    private CustomerDetailResponse MapToDetailResponse(Customer customer)
    {
        return new CustomerDetailResponse
        {
            Id = customer.Id,
            CompanyId = customer.CompanyId,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            TaxId = customer.TaxId,
            Address = customer.Address,
            CurrentState = customer.CurrentState,
            Sales = new List<object>(), // Placeholder
            Invoices = new List<object>(), // Placeholder
            Conversations = new List<object>() // Placeholder
        };
    }
}
