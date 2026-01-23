using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Invoices;
using SaaS.Application.DTOs.Sales;
using SaaS.Application.DTOs.Common;
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

    private string GetUserId()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("sub")?.Value 
            ?? throw new UnauthorizedAccessException("User ID not found in token");
    }

    /// <summary>
    /// Búsqueda de ventas con soporte OData
    /// </summary>
    [HttpGet]
    [HttpGet("search")]
    [ProducesResponseType(typeof(ResponsePagination<SaleResponse>), 200)]
    public async Task<IActionResult> Search(ODataQueryOptions<SaleResponse> queryOptions)
    {
        try
        {
            var companyId = GetCompanyId();
            var result = await _saleService.SearchAsync(queryOptions, companyId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
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
            var created = await _saleService.CreateAsync(request, GetCompanyId(), GetUserId());
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
            var updated = await _saleService.UpdateAsync(id, request, GetCompanyId(), GetUserId());
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
             return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get invoice for a sale. Returns 200 with data=null if no invoice exists yet.
    /// </summary>
    [HttpGet("{id}/invoice")]
    public async Task<ActionResult<ApiResponse<InvoiceResponse>>> GetInvoice(string id)
    {
        var invoice = await _saleService.GetInvoiceAsync(id, GetCompanyId());
        return Ok(new ApiResponse<InvoiceResponse>
        {
            Data = invoice,
            Success = true,
            Message = invoice == null ? "No invoice generated yet for this sale" : null
        });
    }
}
