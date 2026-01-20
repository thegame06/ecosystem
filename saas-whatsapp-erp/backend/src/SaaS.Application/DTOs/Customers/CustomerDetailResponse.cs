namespace SaaS.Application.DTOs.Customers;

public class CustomerDetailResponse : CustomerResponse
{
    // TODO: Tipar correctamente con DTOs de Sales, Invoices, Conversations
    public List<object> Sales { get; set; } = new();
    public List<object> Invoices { get; set; } = new();
    public List<object> Conversations { get; set; } = new();
}
