using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.OData;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using SaaS.Api.Filters;
using SaaS.Application.Interfaces;
using SaaS.Application.Validators;
using SaaS.Infrastructure.Configuration;
using SaaS.Infrastructure.Repositories;
using SaaS.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuración de MongoDB
var mongoSettings = new MongoDbSettings
{
    ConnectionString = builder.Configuration.GetValue<string>("MongoDB:ConnectionString") ?? "mongodb://localhost:27017",
    DatabaseName = builder.Configuration.GetValue<string>("MongoDB:DatabaseName") ?? "saas_whatsapp_erp"
};

// Configuración de JWT
var jwtSettings = new JwtSettings
{
    Secret = builder.Configuration.GetValue<string>("Jwt:Secret") ?? "your-super-secret-key-change-this-in-production-min-32-chars",
    Issuer = builder.Configuration.GetValue<string>("Jwt:Issuer") ?? "SaaSWhatsAppERP",
    Audience = builder.Configuration.GetValue<string>("Jwt:Audience") ?? "SaaSWhatsAppERP",
    ExpirationInMinutes = builder.Configuration.GetValue<int>("Jwt:ExpirationInMinutes", 1440)
};

// Registrar servicios
builder.Services.AddSingleton(mongoSettings);
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<MongoDbSettings>();
    return new MongoClient(settings.ConnectionString);
});
builder.Services.AddSingleton(jwtSettings);

// Repositorios
builder.Services.AddSingleton<ICompanyRepository, CompanyRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICustomerRepository, CustomerRepository>();
builder.Services.AddSingleton<IProductRepository, ProductRepository>();
builder.Services.AddSingleton<ISaleRepository, SaleRepository>();
builder.Services.AddSingleton<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddSingleton<IConversationRepository, ConversationRepository>();
builder.Services.AddSingleton<IUsageCountersRepository, UsageCountersRepository>();
builder.Services.AddSingleton<IWhatsAppNumberRepository, WhatsAppNumberRepository>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<PlanLimitFilter>();
})
.AddOData(options => options
    .Select()
    .Filter()
    .OrderBy()
    .SetMaxTop(100)
    .Count()
);

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<CreateCustomerRequestValidator>();

// Servicios
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISaleService, SaleService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IPlanService, PlanService>();
builder.Services.AddScoped<IWhatsAppProvider, WhatsAppProviderMock>();

// Configurar autenticación JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
    };
});

builder.Services.AddAuthorization();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// builder.Services.AddControllers(); // Removed duplicate
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SaaS WhatsApp ERP API", Version = "v1" });
    
    // Configurar JWT en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseRewriter(new RewriteOptions().AddRedirect(@"(^\/$)|^$", "/swagger"));

}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
