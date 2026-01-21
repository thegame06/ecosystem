namespace SaaS.Application.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class LimitConsumptionAttribute : Attribute
{
    public string ResourceType { get; }

    public LimitConsumptionAttribute(string resourceType)
    {
        ResourceType = resourceType;
    }
}
