# WhatsApp Integration – MVP Scope, Limits & Risks

## ⚠️ CRITICAL NOTICE

This document defines the **OFFICIAL WhatsApp integration strategy** for the MVP.

**If a WhatsApp feature is not explicitly listed here as part of the MVP, it DOES NOT exist.**

---

## 1️⃣ MVP Integration Model

### Technology Used
- **WhatsApp API (Unofficial)**
- **NOT WhatsApp Business Cloud API**
- **NOT WhatsApp Business API (Official)**

### Integration Model
- **BYON (Bring Your Own Number)**
- The WhatsApp number belongs to the **customer** (the company using the SaaS)
- The SaaS system connects to the customer's WhatsApp number
- The customer is responsible for the WhatsApp account

### Why This Model?
- **Zero WhatsApp infrastructure costs** for the SaaS provider
- **Faster MVP launch** (no Meta Business verification required)
- **Lower operational complexity**
- **Customer owns their communication channel**

---

## 2️⃣ What the MVP DOES Support

### ✅ Allowed Features
1. **Manual 1-to-1 messaging**
   - User sends invoice to a single customer
   - User sends payment reminder to a single customer
   - User views conversation history

2. **Invoice delivery**
   - Generate invoice PDF
   - Send PDF via WhatsApp to customer
   - Track delivery status (Sent)

3. **Conversation tracking**
   - View WhatsApp conversations
   - Link conversations to customers
   - Track commercial state (LEAD → SALE → INVOICED → PAID)

4. **Usage limit enforcement**
   - Validate plan limits before sending messages
   - Block action if limit exceeded
   - Suggest plan upgrade

### 📊 Usage Limits by Plan

| Plan | Messages/Month | Conversations/Month | Invoices/Month |
|------|----------------|---------------------|----------------|
| **Starter** | 300 | 150 | 300 |
| **Pro** | 1,000 | 700 | 1,000 |
| **Growth** | 3,000 | Unlimited* | Unlimited* |

\* Fair Use Policy applies

---

## 3️⃣ What the MVP DOES NOT Support

### ❌ Forbidden Features (MVP)
1. **Bots or automated responses**
   - No chatbots
   - No auto-replies
   - No AI-powered responses

2. **Mass messaging**
   - No broadcast messages
   - No campaigns
   - No bulk sending to multiple customers

3. **Automated workflows**
   - No automatic invoice sending
   - No scheduled messages
   - No trigger-based automation

4. **WhatsApp Business Cloud API features**
   - No message templates (official)
   - No interactive buttons
   - No catalog integration
   - No payment integration

5. **Advanced integrations**
   - No CRM sync
   - No marketing automation
   - No external messaging platforms

---

## 4️⃣ Risk of Account Ban

### ⚠️ IMPORTANT WARNING

**WhatsApp can ban numbers that use unofficial APIs.**

### Ban Scenarios
- **Temporary ban**: 24-48 hours (first offense)
- **Permanent ban**: Account permanently disabled (repeat offenses)

### What Increases Ban Risk
1. **Spam behavior**
   - Sending unsolicited messages
   - Sending messages to users who haven't consented

2. **Mass messaging**
   - Sending the same message to multiple recipients
   - Using the system for campaigns

3. **Aggressive automation**
   - High-frequency automated messages
   - Bot-like behavior patterns

4. **Reported by users**
   - Customers marking messages as spam
   - Customers blocking the number

### What Happens if Banned
- **Conversation history is NOT lost** (stored in the system)
- **Customer can replace the WhatsApp number**
- **System continues to operate** with a new number
- **No data loss** (sales, invoices, customers remain intact)

### SaaS Provider Responsibility
**The SaaS provider does NOT guarantee:**
- WhatsApp account recovery
- Prevention of bans
- Compensation for banned numbers

**The customer is responsible for:**
- Using WhatsApp according to Meta's Terms of Service
- Avoiding spam and mass messaging
- Obtaining customer consent before messaging

---

## 5️⃣ Customer Consent

### Mandatory Consent
- **WhatsApp consent must be explicit**
- Customer must agree to receive messages
- Consent is tracked in the `Customer` entity (`WhatsAppConsent` field)

### Consent Validation
- System validates consent before sending messages
- If consent is `false`, message sending is blocked
- User must update consent status manually

---

## 6️⃣ Usage Limit Enforcement

### How Limits Work
1. **Plan defines limits** (messages, conversations, invoices)
2. **System tracks usage** in `UsageCounters` (per month)
3. **Before sending a message**:
   - System checks current usage
   - If limit exceeded → action is blocked
   - User sees upgrade suggestion

### Hard Limits
- **No soft limits** in MVP
- **No grace period**
- **No overage charges** (future feature)

### Upgrade Flow
- User is prompted to upgrade plan
- Upgrade is manual (no auto-billing in MVP)
- After upgrade, limits are increased immediately

---

## 7️⃣ Technical Implementation

### WhatsApp Number Entity
```
WhatsAppNumber {
  Id: ObjectId
  CompanyId: ObjectId
  PhoneNumber: string
  ProviderType: "BYON" | "External"
  IsActive: bool
  CreatedAt: DateTime
}
```

### Conversation Entity
```
Conversation {
  Id: ObjectId
  CompanyId: ObjectId
  CustomerId: ObjectId
  Channel: "WhatsApp"
  LastMessage: string
  LastState: CommercialState
  HasUnreadMessages: bool
  UpdatedAt: DateTime
}
```

### Usage Tracking
```
UsageCounters {
  Id: ObjectId
  CompanyId: ObjectId
  Period: "YYYY-MM"
  MessagesUsed: int
  ConversationsUsed: int
  InvoicesUsed: int
  UsersUsed: int
  CreatedAt: DateTime
}
```

---

## 8️⃣ Message Sending Flow

### Step-by-Step
1. **User action**: User clicks "Send Invoice via WhatsApp"
2. **Validation**:
   - Check if WhatsApp number is active
   - Check if customer has WhatsApp consent
   - Check if message limit is not exceeded
3. **If validation passes**:
   - Generate invoice PDF
   - Send PDF via WhatsApp API
   - Update `Invoice.Status = Sent`
   - Update `Invoice.SentAt = now`
   - Increment `UsageCounters.MessagesUsed`
   - Increment `UsageCounters.InvoicesUsed`
4. **If validation fails**:
   - Block action
   - Show error message
   - Suggest upgrade (if limit exceeded)

---

## 9️⃣ Future / Post-MVP

### 🔮 Planned Features (NOT in MVP)
1. **WhatsApp Business Cloud API**
   - Official Meta integration
   - Message templates
   - Interactive buttons
   - Verified business account

2. **Bots and automation**
   - AI-powered chatbots
   - Auto-replies
   - Workflow automation

3. **Campaigns**
   - Broadcast messages (with opt-in)
   - Segmented campaigns
   - Scheduled messages

4. **Advanced analytics**
   - Message delivery rates
   - Read receipts
   - Response time tracking

5. **Multi-channel**
   - SMS fallback
   - Email integration
   - Social media messaging

### Migration Path
- MVP uses unofficial API (BYON)
- Future versions will support **both**:
  - BYON (for cost-sensitive customers)
  - Official API (for enterprise customers)
- Migration will be **opt-in**
- No forced migration

---

## 🔟 Compliance & Legal

### Terms of Service
The SaaS provider MUST include in the Terms of Service:

1. **WhatsApp ban risk disclaimer**
   - Customer acknowledges the risk of account ban
   - SaaS provider is not responsible for bans

2. **Customer responsibility**
   - Customer owns the WhatsApp number
   - Customer must comply with Meta's Terms of Service
   - Customer must obtain consent from recipients

3. **No guarantees**
   - No uptime guarantee for WhatsApp
   - No message delivery guarantee
   - No account recovery guarantee

### Privacy
- **Conversation data is stored** in the SaaS database
- **Data is encrypted** at rest and in transit
- **Data is multi-tenant** (isolated by `CompanyId`)
- **Data is NOT shared** with third parties

---

## 1️⃣1️⃣ Prohibited Actions

### ❌ Strictly Forbidden
1. **Spam**
   - Sending unsolicited messages
   - Sending messages without consent

2. **Mass messaging**
   - Broadcast to multiple recipients
   - Campaigns without opt-in

3. **Aggressive automation**
   - High-frequency automated messages
   - Bot-like behavior

4. **Violation of Meta's Terms**
   - Using WhatsApp for illegal activities
   - Impersonation
   - Phishing

### Enforcement
- **System-level blocks** (hard limits)
- **Account suspension** (if abuse is detected)
- **Termination of service** (for repeat offenders)

---

## 1️⃣2️⃣ Support & Troubleshooting

### Common Issues

#### Issue: "WhatsApp number is not active"
**Solution**: Verify that the WhatsApp number is correctly configured in Settings.

#### Issue: "Message limit exceeded"
**Solution**: Upgrade to a higher plan or wait for the next billing cycle.

#### Issue: "Customer has not given WhatsApp consent"
**Solution**: Update customer consent status in the customer profile.

#### Issue: "WhatsApp account banned"
**Solution**:
1. Replace the WhatsApp number in Settings
2. Conversation history is preserved
3. Continue operations with the new number

---

## 1️⃣3️⃣ Final Rules

### For Developers
- **Never bypass usage limits**
- **Never implement mass messaging** (even if requested)
- **Always validate consent** before sending messages
- **Always track usage** in `UsageCounters`

### For Product Team
- **WhatsApp is a paid resource**
- **Limits are hard** (no exceptions)
- **Ban risk is real** (must be communicated)
- **BYON is the only model** (for MVP)

### For Sales Team
- **Explain ban risk** to customers
- **Explain limits** clearly
- **Explain BYON model** (customer owns number)
- **Do NOT promise features** not in this document

---

## 1️⃣4️⃣ Document Status

**Version**: 1.0  
**Last Updated**: 2026-01-21  
**Status**: Official  
**Scope**: MVP Only

**If a WhatsApp feature is not listed here, it does NOT exist in the MVP.**

**This document is the source of truth for WhatsApp integration.**
