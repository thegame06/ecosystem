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
    private readonly IWhatsAppProvider _whatsAppProvider;

    private readonly IPlanService _planService;
    private readonly IConversationMessageService _conversationMessageService;

    public ConversationService(
        IConversationRepository conversationRepository,
        ICustomerRepository customerRepository,
        IConversationMessageService conversationMessageService,
        IWhatsAppProvider whatsAppProvider,
        IPlanService planService)
    {
        _conversationRepository = conversationRepository;
        _customerRepository = customerRepository;
        _conversationMessageService = conversationMessageService;
        _whatsAppProvider = whatsAppProvider;
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
            RemoteJid = conversation.RemoteJid,
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
            Items = results,
            PageNumber = skip / top + 1,
            RowsPerPage = top,
            TotalCount = totalCount
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
            RemoteJid = customer.RemoteJid,
            Email = customer.Email,
            Address = customer.Address,
            TaxId = customer.TaxId,
            CurrentState = customer.CurrentState
        };
    }

    public async Task HandleIncomingMessageAsync(string companyId, string fromPhone, string text, string? pushName = null, string? remoteJid = null, string? externalId = null, DateTime? timestamp = null)
    {
        try 
        {
            // 1. Cargar o crear cliente (Identity Resolution)
            // Priorizamos búsqueda por RemoteJid si está disponible, ya que es la identidad real en WhatsApp Web/Evolution
            Customer? customer = null;
            if (!string.IsNullOrEmpty(remoteJid))
            {
                customer = await _customerRepository.GetByRemoteJidAsync(companyId, remoteJid);
            }

            // Fallback a teléfono si no se encontró por JID o no hay JID
            if (customer == null)
            {
                customer = await _customerRepository.GetByPhoneAsync(companyId, fromPhone);
            }

            if (customer == null)
            {
                var customerName = !string.IsNullOrEmpty(pushName) ? pushName : fromPhone;
                
                customer = new Customer 
                {
                    CompanyId = companyId,
                    Phone = fromPhone,
                    RemoteJid = remoteJid,
                    Name = customerName,
                    CurrentState = CommercialState.LEAD,
                    CreatedAt = DateTime.UtcNow
                };
                await _customerRepository.CreateAsync(customer);
            }
            else 
            {
                var updated = false;
                // Auto-update name if it was just the phone number
                if (customer.Name == customer.Phone && !string.IsNullOrEmpty(pushName))
                {
                    customer.Name = pushName;
                    updated = true;
                }

                // Asegurar que guardamos el RemoteJid si no lo teníamos (Sincronización)
                if (string.IsNullOrEmpty(customer.RemoteJid) && !string.IsNullOrEmpty(remoteJid))
                {
                    customer.RemoteJid = remoteJid;
                    updated = true;
                }

                if (updated)
                {
                    await _customerRepository.UpdateAsync(customer);
                }
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
                    RemoteJid = customer.RemoteJid,
                    LastMessage = text,
                    LastState = customer.CurrentState,
                    HasUnreadMessages = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    LastActivityAt = DateTime.UtcNow,
                    Channel = "WhatsApp",
                    IsActive = true
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
                
                // Sincronizar RemoteJid si cambió o no existía
                if (string.IsNullOrEmpty(conversation.RemoteJid) && !string.IsNullOrEmpty(customer.RemoteJid))
                {
                    conversation.RemoteJid = customer.RemoteJid;
                }

                await _conversationRepository.UpdateAsync(conversation);
            }

            // 3. Guardar Mensaje (Tracking)
            var msgRequest = new CreateMessageRequest
            {
                ConversationId = conversation.Id,
                CustomerId = customer.Id,
                ExternalId = externalId,
                RemoteJid = remoteJid,
                PushName = pushName,
                CustomerPhone = customer.Phone,
                FromMe = false,
                SenderName = customer.Name,
                Content = text,
                Type = MessageType.TEXT,
                Timestamp = timestamp
            };
            
            await _conversationMessageService.CreateMessageAsync(companyId, msgRequest);
        }
        catch (Exception ex)
        {
            // Logging simple via Console para depuración rápida en Docker/Console
            Console.WriteLine($"[ERROR] HandleIncomingMessageAsync: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            throw; // Re-throw to see in controller logs too
        }
    }

    public async Task<bool> SendMessageAsync(string conversationId, string message, string companyId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null || conversation.CompanyId != companyId)
            return false;

        var customer = await _customerRepository.GetByIdAsync(conversation.CustomerId);
        if (customer == null) return false;

        // 1. Validar límites de mensajes (Hard Limit)
        var canSend = await _planService.CanConsumeAsync(companyId, "messages");
        if (!canSend) return false;

        // 2. Enviar via Provider (Preferir RemoteJid si existe para Evolution API)
        var targetNumber = !string.IsNullOrEmpty(customer.RemoteJid) ? customer.RemoteJid : customer.Phone;
        var success = await _whatsAppProvider.SendTextMessageAsync(companyId, targetNumber, message);
        
        // 3. Guardar Mensaje Saliente (Tracking)
        await _conversationMessageService.CreateMessageAsync(companyId, new CreateMessageRequest
        {
            ConversationId = conversation.Id,
            CustomerId = customer.Id,
            RemoteJid = targetNumber,
            FromMe = true, // Es saliente
            SenderName = "System",
            Content = message,
            Type = MessageType.TEXT,
            Timestamp = DateTime.UtcNow,
            Status = success ? MessageStatus.SENT : MessageStatus.FAILED
        });

        if (success)
        {
            Console.WriteLine($"[SUCCESS] Message sent to {targetNumber}");
            // 4. Actualizar conversación
            conversation.LastMessage = message;
            conversation.UpdatedAt = DateTime.UtcNow;
            conversation.LastActivityAt = DateTime.UtcNow;
            await _conversationRepository.UpdateAsync(conversation);

            // 5. Track consumption
            await _planService.TrackConsumptionAsync(companyId, "messages");
        }
        else
        {
            Console.WriteLine($"[ERROR] Failed to send message to {customer.Phone}");
        }

        return success;
    }

    public async Task<bool> CloseAsync(string conversationId, string companyId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        if (conversation == null || conversation.CompanyId != companyId)
            return false;

        conversation.LastState = CommercialState.CLOSED;
        conversation.UpdatedAt = DateTime.UtcNow;
        // conversation.IsActive = false; // Optional logic: "Archive" it
        
        await _conversationRepository.UpdateAsync(conversation);
        return true;
    }

    public async Task<bool> ReOpenAsync(string conversationId, string companyId)
    {
        // Reopen implementation can be added later if needed.
        // For MVP, inbound messages re-open/update threads naturally.
        return await Task.FromResult(false); 
    }

    private ConversationResponse MapToResponse(Conversation conversation)
    {
        return new ConversationResponse
        {
            Id = conversation.Id,
            CompanyId = conversation.CompanyId,
            CustomerId = conversation.CustomerId,
            CustomerPhone = conversation.CustomerPhone,
            RemoteJid = conversation.RemoteJid,
            Channel = conversation.Channel,
            LastMessage = conversation.LastMessage,
            LastState = conversation.LastState,
            LastActivityAt = conversation.LastActivityAt,
            IsActive = conversation.IsActive
        };
    }
}
