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

    public ConversationService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
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
             existing.HasUnreadMessages = true; // Asumimos entrante? O saliente?
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
