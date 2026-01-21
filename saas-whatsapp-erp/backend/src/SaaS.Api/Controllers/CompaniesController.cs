using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.SaaS;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUsageCountersRepository _usageRepository;

    public CompaniesController(ICompanyRepository companyRepository, IUsageCountersRepository usageRepository)
    {
        _companyRepository = companyRepository;
        _usageRepository = usageRepository;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    [HttpGet]
    public async Task<ActionResult<Company>> Get()
    {
        return await GetMe();
    }

    [HttpGet("me")]
    public async Task<ActionResult<Company>> GetMe()
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();
        return Ok(company);
    }

    [HttpGet("usage")]
    public async Task<ActionResult> GetUsage()
    {
        var period = DateTime.UtcNow.ToString("yyyy-MM");
        var usage = await _usageRepository.GetCurrentAsync(GetCompanyId(), period);
        
        if (usage == null)
        {
            return Ok(new { 
                messagesUsed = 0, 
                conversationsUsed = 0, 
                invoicesUsed = 0, 
                usersUsed = 0 
            });
        }

        return Ok(usage);
    }

    [HttpGet("limits")]
    public async Task<ActionResult> GetLimits()
    {
        var company = await _companyRepository.GetByIdAsync(GetCompanyId());
        if (company == null) return NotFound();

        var limits = PlanLimits.GetLimits(company.Plan);
        return Ok(limits);
    }

    [HttpPut("plan")]
    public async Task<ActionResult> UpdatePlan([FromBody] SaaS.Domain.Enums.PlanType plan)
    {
        await _companyRepository.UpdatePlanAsync(GetCompanyId(), plan);
        return Ok(new { message = $"Plan actualizado a {plan}" });
    }
}
