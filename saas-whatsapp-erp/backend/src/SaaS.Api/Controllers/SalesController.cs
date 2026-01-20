using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Invoices;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.Interfaces;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    [HttpGet]
    public async Task<ActionResult<List<SaleResponse>>> GetAll()
    {
        var sales = await _saleService.GetAllAsync(GetCompanyId());
        return Ok(sales);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SaleResponse>> GetById(string id)
    {
        var sale = await _saleService.GetByIdAsync(id, GetCompanyId());
        if (sale == null) return NotFound();
        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<SaleResponse>> Create([FromBody] CreateSaleRequest request)
    {
        try
        {
            var created = await _saleService.CreateAsync(request, GetCompanyId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
         catch (InvalidOperationException ex)
        {
            // Stock insuficiente
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SaleResponse>> Update(string id, [FromBody] UpdateSaleRequest request)
    {
        try
        {
            var updated = await _saleService.UpdateAsync(id, request, GetCompanyId());
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/invoice")]
    public async Task<ActionResult<InvoiceResponse>> GetInvoice(string id)
    {
        var invoice = await _saleService.GetInvoiceAsync(id, GetCompanyId());
        if (invoice == null) return NotFound("Invoice not found for this sale. Maybe it hasn't been generated yet.");
        return Ok(invoice);
    }
}
