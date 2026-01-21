using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SaaS.Domain.Enums;

namespace SaaS.Domain.Documents;

public class Company
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("country")]
    public string Country { get; set; } = "NI"; // Nicaragua por defecto

    [BsonElement("taxRate")]
    public decimal TaxRate { get; set; } = 0.15m; // 15% IVA por defecto

    [BsonElement("isTaxEnabled")]
    public bool IsTaxEnabled { get; set; } = true;

    [BsonElement("invoiceSequence")]
    public int InvoiceSequence { get; set; } = 1;

    [BsonElement("plan")]
    public PlanType Plan { get; set; } = PlanType.Starter;

    [BsonElement("billingCycleStart")]
    public DateTime BillingCycleStart { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;
}
