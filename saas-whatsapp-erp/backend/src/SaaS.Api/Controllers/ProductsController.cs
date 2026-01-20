using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SaaS.Application.DTOs.Products;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using System.Security.Claims;

namespace SaaS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public ProductsController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    /// <summary>
    /// Obtener todos los productos de la empresa del usuario autenticado
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ProductResponse>>> GetAll()
    {
        try
        {
            var companyId = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyId))
            {
                return Unauthorized(new { message = "Company not found in token" });
            }

            var products = await _productRepository.GetByCompanyIdAsync(companyId);
            var response = products.Select(p => MapToResponse(p)).ToList();
            
            return Ok(response);
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
            var companyId = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyId))
            {
                return Unauthorized(new { message = "Company not found in token" });
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            // Verificar que el producto pertenece a la empresa del usuario (Multi-tenant)
            if (product.CompanyId != companyId)
            {
                return Forbid();
            }

            return Ok(MapToResponse(product));
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
            var companyId = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyId))
            {
                return Unauthorized(new { message = "Company not found in token" });
            }

            var product = new Product
            {
                CompanyId = companyId,
                Name = request.Name,
                Description = request.Description,
                Type = request.Type,
                Price = request.Price,
                CostPrice = request.CostPrice,
                TaxRate = request.TaxRate,
                TrackInventory = request.TrackInventory,
                StockQuantity = request.Stock,
                RentalPricePerDay = request.RentalPricePerDay,
                RentalPricePerHour = request.RentalPricePerHour
            };

            var created = await _productRepository.CreateAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToResponse(created));
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
            var companyId = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyId))
            {
                return Unauthorized(new { message = "Company not found in token" });
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            // Verificar que el producto pertenece a la empresa del usuario (Multi-tenant)
            if (product.CompanyId != companyId)
            {
                return Forbid();
            }

            // Actualizar campos
            product.Name = request.Name;
            product.Description = request.Description;
            product.Type = request.Type;
            product.Price = request.Price;
            product.CostPrice = request.CostPrice;
            product.TaxRate = request.TaxRate;
            product.TrackInventory = request.TrackInventory;
            product.StockQuantity = request.Stock;
            product.RentalPricePerDay = request.RentalPricePerDay;
            product.RentalPricePerHour = request.RentalPricePerHour;
            product.IsActive = request.IsActive;

            var updated = await _productRepository.UpdateAsync(product);
            return Ok(MapToResponse(updated));
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
            var companyId = User.FindFirst("companyId")?.Value;
            if (string.IsNullOrEmpty(companyId))
            {
                return Unauthorized(new { message = "Company not found in token" });
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            // Verificar que el producto pertenece a la empresa del usuario (Multi-tenant)
            if (product.CompanyId != companyId)
            {
                return Forbid();
            }

            await _productRepository.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred", error = ex.Message });
        }
    }

    private static ProductResponse MapToResponse(Product product)
    {
        return new ProductResponse
        {
            Id = product.Id,
            CompanyId = product.CompanyId,
            Name = product.Name,
            Description = product.Description,
            Type = product.Type,
            Price = product.Price,
            CostPrice = product.CostPrice,
            TaxRate = product.TaxRate,
            TrackInventory = product.TrackInventory,
            Stock = product.StockQuantity,
            RentalPricePerDay = product.RentalPricePerDay,
            RentalPricePerHour = product.RentalPricePerHour,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
