using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Customers;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.DTOs.Common;
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

    /// <summary>
    /// Búsqueda de clientes con soporte OData
    /// </summary>
    [HttpGet]
    [HttpGet("search")]
    [ProducesResponseType(typeof(ResponsePagination<CustomerResponse>), 200)]
    [EnableQuery(MaxTop = 100, AllowedQueryOptions = 
        AllowedQueryOptions.Filter | 
        AllowedQueryOptions.OrderBy | 
        AllowedQueryOptions.Skip | 
        AllowedQueryOptions.Top | 
        AllowedQueryOptions.Count)]
    public async Task<IActionResult> Search(ODataQueryOptions<CustomerResponse> queryOptions)
    {
        try
        {
            var companyId = GetCompanyId();
            var result = await _customerService.SearchAsync(queryOptions, companyId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
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
