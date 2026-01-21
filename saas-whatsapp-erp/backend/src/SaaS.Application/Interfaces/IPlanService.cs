namespace SaaS.Application.Interfaces;

public interface IPlanService
{
    Task<bool> CanConsumeAsync(string companyId, string resourceType);
    Task TrackConsumptionAsync(string companyId, string resourceType, int amount = 1);
}
