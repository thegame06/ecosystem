using Microsoft.AspNetCore.OData.Query;
using SaaS.Application.DTOs.Common;
using SaaS.Application.DTOs.Conversations;
using SaaS.Application.DTOs.Customers;
using SaaS.Application.Interfaces;
using SaaS.Domain.Documents;
using SaaS.Domain.Enums;

namespace SaaS.Infrastructure.Services;

public class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IPlanService _planService;

    public ConversationService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        IPlanService planService)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _planService = planService;
    }

    public async Task<ResponsePagination<ConversationResponse>> SearchAsync(
        ODataQueryOptions<ConversationResponse> queryOptions, 
        string companyId)
    {
        // 1. Obtener IQueryable filtrado por companyId (NO carga datos)
        var conversationsQuery = _conversationRepository.GetQueryable(companyId);
        
        // 2. Mapear a DTOs inline (aún NO ejecuta query)
        var conversationResponses = conversationsQuery.Select(conversation => new ConversationResponse
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId,
            CustomerId = conversation.CustomerId,
            CustomerPhone = conversation.CustomerPhone,
            Channel = conversation.Channel,
            LastMessage = conversation.LastMessage,
            LastState = conversation.LastState,
            LastActivityAt = conversation.UpdatedAt,
            IsActive = conversation.IsActive
        });

        // 3. Aplicar OData (TODAVÍA en MongoDB)
        var filteredQuery = queryOptions.ApplyTo(conversationResponses) as IQueryable<ConversationResponse>;
        
        // 4. Contar total (ejecuta COUNT en MongoDB)
        var totalCount = filteredQuery?.LongCount() ?? 0;

        // 5. Extraer skip y top
        var skip = queryOptions.Skip?.Value ?? 0;
        var top = queryOptions.Top?.Value ?? 20;

        // 6. Aplicar paginación y ejecutar (solo trae registros necesarios)
        var results = filteredQuery?
            .Skip(skip)
            .Take(top)
            .ToList() ?? new List<ConversationResponse>();

        return new ResponsePagination<ConversationResponse>
        {
            Result = results,
            Page = skip,
            RowsPerPage = top,
            TotalRows = totalCount
        };
    }

    public async Task<List<ConversationResponse>> GetAllAsync(string companyId)
    {
        var conversations = await _conversationRepository.GetByCompanyIdAsync(companyId);
        return conversations.Select(MapToResponse).ToList();
    }

    public async Task<ConversationResponse?> GetByIdAsync(string id, string companyId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null || conversation.CompanyId != companyId)
            return null;

        return MapToResponse(conversation);
    }

    public async Task<ConversationResponse> CreateAsync(CreateConversationRequest request, string companyId)
    {
        // Buscar cliente por telefono, si no existe crear
        var customer = await _customerRepository.GetByPhoneAsync(companyId, request.CustomerPhone);
        if (customer == null)
        {
            customer = new Customer
            {
                 CompanyId = companyId,
                 Phone = request.CustomerPhone,
                 Name = request.CustomerName ?? request.CustomerPhone, // Fallback name
                 CreatedAt = DateTime.UtcNow,
                 UpdatedAt = DateTime.UtcNow,
                 IsActive = true,
                 CurrentState = CommercialState.LEAD
            };
            await _customerRepository.CreateAsync(customer);
        }

        // Verificar si ya existe conversacion
        var existing = await _conversationRepository.GetByCustomerIdAsync(companyId, customer.Id);
        if (existing != null)
        {
             // Update existing
             existing.LastMessage = request.InitialMessage;
             existing.UpdatedAt = DateTime.UtcNow;
             existing.LastActivityAt = DateTime.UtcNow;
             existing.HasUnreadMessages = true; 
             await _conversationRepository.UpdateAsync(existing);
             return MapToResponse(existing);
        }

        var conversation = new Conversation
        {
            CompanyId = companyId,
            CustomerId = customer.Id,
            CustomerPhone = customer.Phone,
            Channel = "WhatsApp",
            LastMessage = request.InitialMessage,
            LastState = customer.CurrentState,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastActivityAt = DateTime.UtcNow,
            IsActive = true,
            HasUnreadMessages = true
        };

        var created = await _conversationRepository.CreateAsync(conversation);
        
        // Track conversation consumption
        await _planService.TrackConsumptionAsync(companyId, "conversations");

        return MapToResponse(created);
    }

    public async Task<ConversationResponse?> UpdateAsync(string id, UpdateConversationRequest request, string companyId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(id);
        if (conversation == null || conversation.CompanyId != companyId)
            return null;

        if (request.LastMessage != null)
            conversation.LastMessage = request.LastMessage;
        
        if (request.HasUnreadMessages.HasValue)
            conversation.HasUnreadMessages = request.HasUnreadMessages.Value;

        conversation.UpdatedAt = DateTime.UtcNow;
        conversation.LastActivityAt = DateTime.UtcNow;

        var updated = await _conversationRepository.UpdateAsync(conversation);
        return MapToResponse(updated);
    }

    public async Task<CustomerResponse?> GetCustomerAsync(string conversationId, string companyId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null || conversation.CompanyId != companyId)
            return null;
        
        var customer = await _customerRepository.GetByIdAsync(conversation.CustomerId);
        if (customer == null) return null;

        return new CustomerResponse 
        {
            Id = customer.Id,
            CompanyId = customer.CompanyId,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            TaxId = customer.TaxId,
            CurrentState = customer.CurrentState
        };
    }

    public async Task HandleIncomingMessageAsync(string companyId, string fromPhone, string text)
    {
        // 1. Cargar o crear cliente
        var customer = await _customerRepository.GetByPhoneAsync(companyId, fromPhone);
        if (customer == null)
        {
            customer = new Customer
            {
                CompanyId = companyId,
                Phone = fromPhone,
                Name = fromPhone, // Fallback
                CurrentState = CommercialState.LEAD,
                CreatedAt = DateTime.UtcNow
            };
            await _customerRepository.CreateAsync(customer);
        }

        // 2. Cargar o crear conversación
        var conversation = await _conversationRepository.GetByCustomerIdAsync(companyId, customer.Id);
        if (conversation == null)
        {
            conversation = new Conversation
            {
                CompanyId = companyId,
                CustomerId = customer.Id,
                CustomerPhone = customer.Phone,
                LastMessage = text,
                LastState = customer.CurrentState,
                HasUnreadMessages = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _conversationRepository.CreateAsync(conversation);
            
            // Track new conversation
            await _planService.TrackConsumptionAsync(companyId, "conversations");
        }
        else
        {
            conversation.LastMessage = text;
            conversation.HasUnreadMessages = true;
            conversation.UpdatedAt = DateTime.UtcNow;
            conversation.LastActivityAt = DateTime.UtcNow;
            await _conversationRepository.UpdateAsync(conversation);
        }
    }

    private ConversationResponse MapToResponse(Conversation conversation)
    {
        return new ConversationResponse
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId,
            CustomerId = conversation.CustomerId,
            Channel = conversation.Channel,
            LastMessage = conversation.LastMessage,
            LastState = conversation.LastState,
            LastActivityAt = conversation.LastActivityAt,
            IsActive = conversation.IsActive
        };
    }
}
