using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Conversations;
using SaaS.Application.DTOs.Customers;
using SaaS.Application.Interfaces;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ConversationsController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    [HttpGet]
    public async Task<ActionResult<List<ConversationResponse>>> GetAll()
    {
        var conversations = await _conversationService.GetAllAsync(GetCompanyId());
        return Ok(conversations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConversationResponse>> GetById(string id)
    {
        var conversation = await _conversationService.GetByIdAsync(id, GetCompanyId());
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }
    
    [HttpPost]
    public async Task<ActionResult<ConversationResponse>> Create([FromBody] CreateConversationRequest request)
    {
        var conversation = await _conversationService.CreateAsync(request, GetCompanyId());
        return CreatedAtAction(nameof(GetById), new { id = conversation.Id }, conversation);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ConversationResponse>> Update(string id, [FromBody] UpdateConversationRequest request)
    {
        var updated = await _conversationService.UpdateAsync(id, request, GetCompanyId());
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpGet("{id}/customer")]
    public async Task<ActionResult<CustomerResponse>> GetCustomer(string id)
    {
        var customer = await _conversationService.GetCustomerAsync(id, GetCompanyId());
        if (customer == null) return NotFound();
        return Ok(customer);
    }
}
