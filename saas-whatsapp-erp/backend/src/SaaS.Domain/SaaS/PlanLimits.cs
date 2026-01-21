using SaaS.Domain.Enums;

namespace SaaS.Domain.SaaS;

public class PlanLimits
{
    public int MaxUsers { get; set; }
    public int MaxMessages { get; set; }
    public int MaxConversations { get; set; }
    public int MaxInvoices { get; set; }
    public bool WhatsAppIntegrated { get; set; }

    public static PlanLimits GetLimits(PlanType plan)
    {
        return plan switch
        {
            PlanType.Starter => new PlanLimits
            {
                MaxUsers = 1,
                MaxMessages = 300,
                MaxConversations = 150,
                MaxInvoices = 300,
                WhatsAppIntegrated = false
            },
            PlanType.Pro => new PlanLimits
            {
                MaxUsers = 3,
                MaxMessages = 1000,
                MaxConversations = 700,
                MaxInvoices = 1000,
                WhatsAppIntegrated = true
            },
            PlanType.Growth => new PlanLimits
            {
                MaxUsers = 5,
                MaxMessages = 3000,
                MaxConversations = 10000, // Fair use
                MaxInvoices = 10000,      // Fair use
                WhatsAppIntegrated = true
            },
            _ => new PlanLimits()
        };
    }
}
