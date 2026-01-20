using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Customers;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.Interfaces;
using System.Security.Claims;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerResponse>>> GetAll()
    {
        var customers = await _customerService.GetAllAsync(GetCompanyId());
        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerResponse>> GetById(string id)
    {
        var customer = await _customerService.GetByIdAsync(id, GetCompanyId());
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponse>> Create([FromBody] CreateCustomerRequest request)
    {
        try 
        {
            var created = await _customerService.CreateAsync(request, GetCompanyId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch(InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerResponse>> Update(string id, [FromBody] UpdateCustomerRequest request)
    {
        try
        {
            var updated = await _customerService.UpdateAsync(id, request, GetCompanyId());
            if (updated == null) return NotFound();
            return Ok(updated);
        }
         catch(InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var success = await _customerService.DeleteAsync(id, GetCompanyId());
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/sales")]
    public async Task<ActionResult<List<SaleResponse>>> GetSales(string id)
    {
        var sales = await _customerService.GetSalesByCustomerAsync(id, GetCompanyId());
        return Ok(sales);
    }
}
