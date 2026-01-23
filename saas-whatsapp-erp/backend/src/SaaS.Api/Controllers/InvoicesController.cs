using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.Attributes;
using SaaS.Application.DTOs.Invoices;
using SaaS.Application.DTOs.Common;
using SaaS.Application.Interfaces;

namespace SaaS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    /// <summary>
    /// Búsqueda de facturas con soporte OData
    /// </summary>
    [HttpGet]
    [HttpGet("search")]
    [ProducesResponseType(typeof(ResponsePagination<InvoiceResponse>), 200)]
    public async Task<IActionResult> Search(ODataQueryOptions<InvoiceResponse> queryOptions)
    {
        try
        {
            var companyId = GetCompanyId();
            var result = await _invoiceService.SearchAsync(queryOptions, companyId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceResponse>> GetById(string id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id, GetCompanyId());
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    [LimitConsumption("invoices")]
    public async Task<ActionResult<InvoiceResponse>> Create([FromBody] CreateInvoiceRequest request)
    {
        try
        {
            var created = await _invoiceService.CreateAsync(request, GetCompanyId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
         catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<InvoiceResponse>> UpdateStatus(string id, [FromBody] UpdateInvoiceStatusRequest request)
    {
        var updated = await _invoiceService.UpdateStatusAsync(id, request, GetCompanyId());
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpGet("{id}/pdf")]
    public async Task<ActionResult> GetPdf(string id)
    {
        try
        {
            var companyId = GetCompanyId();
            
            // Get invoice to build professional filename
            var invoice = await _invoiceService.GetByIdAsync(id, companyId);
            if (invoice == null) 
            {
                return NotFound(new { message = $"Invoice {id} not found" });
            }
            
            // Generate PDF
            var pdfBytes = await _invoiceService.GeneratePdfAsync(id, companyId);
            if (pdfBytes == null || pdfBytes.Length == 0) 
            {
                return BadRequest(new { message = "Could not generate PDF content. Verify invoice data is complete." });
            }
            
            // Professional filename: Factura_{Number}_{Date}.pdf
            var date = invoice.IssuedAt ?? DateTime.UtcNow;
            var filename = $"Factura_{invoice.Number}_{date:yyyyMMdd}.pdf";
            
            return File(pdfBytes, "application/pdf", filename);
        }
        catch (Exception ex)
        {
            // Log the error more specifically if we had an ILogger here
            return StatusCode(500, new { message = "Error generating PDF", error = ex.Message });
        }
    }

    [HttpPost("{id}/send-whatsapp")]
    [LimitConsumption("messages")]
    public async Task<ActionResult> SendWhatsApp(string id)
    {
         await _invoiceService.SendWhatsAppAsync(id, GetCompanyId());
         return Ok(new { message = "Se ha intentado enviar el mensaje" });
    }
}
