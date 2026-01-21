using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SaaS.Application.Attributes;
using SaaS.Application.Interfaces;
using System.Reflection;

namespace SaaS.Api.Filters;

public class PlanLimitFilter : IAsyncActionFilter
{
    private readonly IPlanService _planService;

    public PlanLimitFilter(IPlanService planService)
    {
        _planService = planService;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var attribute = context.ActionDescriptor.EndpointMetadata
            .OfType<LimitConsumptionAttribute>()
            .FirstOrDefault();

        if (attribute == null)
        {
            await next();
            return;
        }

        var companyId = context.HttpContext.User.FindFirst("companyId")?.Value;
        if (string.IsNullOrEmpty(companyId))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Company ID missing in token" });
            return;
        }

        // 1. Validar antes de ejecutar
        var canConsume = await _planService.CanConsumeAsync(companyId, attribute.ResourceType);
        if (!canConsume)
        {
            context.Result = new ObjectResult(new 
            { 
                message = $"Has alcanzado el límite de {attribute.ResourceType} para tu plan actual. Por favor, sube de plan para continuar.",
                resource = attribute.ResourceType,
                action = "BLOCK"
            }) { StatusCode = 403 };
            return;
        }

        // 2. Ejecutar la acción
        var resultContext = await next();

        // 3. Registrar consumo solo si la respuesta es exitosa (2xx)
        if (resultContext.Exception == null && 
            resultContext.HttpContext.Response.StatusCode >= 200 && 
            resultContext.HttpContext.Response.StatusCode < 300)
        {
            await _planService.TrackConsumptionAsync(companyId, attribute.ResourceType);
        }
    }
}
