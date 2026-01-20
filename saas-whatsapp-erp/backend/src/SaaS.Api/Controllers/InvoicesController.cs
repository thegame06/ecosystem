using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Invoices;
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

    [HttpGet]
    public async Task<ActionResult<List<InvoiceResponse>>> GetAll()
    {
        var invoices = await _invoiceService.GetAllAsync(GetCompanyId());
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceResponse>> GetById(string id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id, GetCompanyId());
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
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
             var pdfBytes = await _invoiceService.GeneratePdfAsync(id, GetCompanyId());
             return File(pdfBytes, "application/pdf", $"invoice-{id}.pdf");
        }
        catch
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/send-whatsapp")]
    public async Task<ActionResult> SendWhatsApp(string id)
    {
         var success = await _invoiceService.SendWhatsAppAsync(id, GetCompanyId());
         if (!success) return BadRequest("Could not send WhatsApp");
         return Ok(new { message = "Sent successfully" });
    }
}
