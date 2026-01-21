using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SaaS.Domain.Documents;

public class UsageCounters
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("companyId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CompanyId { get; set; } = string.Empty;

    [BsonElement("period")]
    public string Period { get; set; } = string.Empty; // Format: YYYY-MM

    [BsonElement("messagesUsed")]
    public int MessagesUsed { get; set; } = 0;

    [BsonElement("conversationsUsed")]
    public int ConversationsUsed { get; set; } = 0;

    [BsonElement("invoicesUsed")]
    public int InvoicesUsed { get; set; } = 0;

    [BsonElement("usersUsed")]
    public int UsersUsed { get; set; } = 0;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
