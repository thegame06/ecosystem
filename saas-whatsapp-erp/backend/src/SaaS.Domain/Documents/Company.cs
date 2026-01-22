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

    [BsonElement("currencySymbol")]
    public string CurrencySymbol { get; set; } = "$";

    [BsonElement("invoiceSequence")]
    public int InvoiceSequence { get; set; } = 1;

    [BsonElement("plan")]
    public PlanType Plan { get; set; } = PlanType.Starter;

    [BsonElement("billingCycleStart")]
    public DateTime BillingCycleStart { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("whatsAppSettings")]
    public WhatsAppSettings? WhatsAppSettings { get; set; }
}

public class WhatsAppSettings
{
    [BsonElement("phoneNumberId")]
    public string PhoneNumberId { get; set; } = string.Empty;

    [BsonElement("businessAccountId")]
    public string BusinessAccountId { get; set; } = string.Empty;

    [BsonElement("accessToken")]
    public string AccessToken { get; set; } = string.Empty;

    [BsonElement("verifyToken")]
    public string VerifyToken { get; set; } = "saas-verify-token";

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}
