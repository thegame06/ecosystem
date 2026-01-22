using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Products;
using SaaS.Application.DTOs.Common;
using SaaS.Application.Interfaces;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    private string GetCompanyId()
    {
        return User.FindFirst("companyId")?.Value ?? throw new UnauthorizedAccessException("Company ID not found in token");
    }

    /// <summary>
    /// Búsqueda de productos con soporte OData
    /// Soporta: $filter, $orderby, $skip, $top, $count
    /// </summary>
    [HttpGet]
    [HttpGet("search")]
    [ProducesResponseType(typeof(ResponsePagination<ProductResponse>), 200)]
    public async Task<IActionResult> Search(ODataQueryOptions<ProductResponse> queryOptions)
    {
        try
        {
            var companyId = GetCompanyId();
            var result = await _productService.SearchAsync(queryOptions, companyId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtener un producto por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetById(string id)
    {
        try
        {
            var companyId = GetCompanyId();
            var product = await _productService.GetByIdAsync(id, companyId);
            
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    /// <summary>
    /// Crear un nuevo producto
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> Create([FromBody] CreateProductRequest request)
    {
        try
        {
            var companyId = GetCompanyId();
            var created = await _productService.CreateAsync(request, companyId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar un producto existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductResponse>> Update(string id, [FromBody] UpdateProductRequest request)
    {
        try
        {
            var companyId = GetCompanyId();
            var updated = await _productService.UpdateAsync(id, request, companyId);
            
            if (updated == null)
                return NotFound(new { message = "Product not found" });

            return Ok(updated);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    /// <summary>
    /// Eliminar un producto (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        try
        {
            var companyId = GetCompanyId();
            var success = await _productService.DeleteAsync(id, companyId);
            
            if (!success)
                return NotFound(new { message = "Product not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }
}
