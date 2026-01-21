# Sales Flow – WhatsApp → Sale → Invoice → Payment (MVP)

This document defines the **official commercial flow** of the MVP.
It describes how a lead moves from a WhatsApp conversation
to a sale, an invoice, and finally a paid transaction.

If a step is not described here, it does not exist in the MVP.

---

## 1️⃣ Entry Point: WhatsApp Conversation

### Trigger
- An inbound WhatsApp message is received
- OR a new conversation is manually created

### Actions
- Create or load `Customer`
- Create or update `Conversation`
- Set `CommercialState = LEAD`

### Notes
- WhatsApp is the primary channel
- No sales exist without a conversation
- One active conversation per customer is assumed in MVP

---

## 2️⃣ Lead Qualification (LEAD)

### Allowed Actions
- Chat with customer
- View customer history
- Create Sale

### Forbidden Actions
- Create Invoice
- Mark as Paid

### State
- `CommercialState = LEAD`

---

## 3️⃣ Sale Creation (SALE_CREATED)

### Trigger
- User creates a Sale from:
  - Conversation
  - POS screen

### Actions
- Create `Sale`
- Attach `CustomerId` and `CompanyId`
- Add `Sale.Items`
- Apply:
  - Unit price
  - Discounts
  - IVA rules
- Calculate:
  - Subtotal
  - TaxTotal
  - Total (per `pricing_calculation_rules.md`)
- Update states:
  - `Sale.State = SALE_CREATED`
  - `Customer.CurrentState = SALE_CREATED`

### Validations
- Company usage limits must allow Sale creation
- Product must be active
- Quantities > 0
- Discounts must be valid

---

## 4️⃣ Invoice Generation (INVOICED)

### Trigger
- User generates an Invoice from a Sale

### Actions
- Create `Invoice` as a snapshot of `Sale`
- Assign sequential `Invoice.Number`
- Copy:
  - Subtotal
  - TaxTotal
  - Total
- Set:
  - `Invoice.Status = Issued`
- Update states:
  - `Sale.State = INVOICED`
  - `Customer.CurrentState = INVOICED`

### Rules
- Invoice MUST NOT recalculate prices
- Invoice cannot exist without a Sale

---

## 5️⃣ Invoice Delivery via WhatsApp (SENT)

### Trigger
- User sends Invoice through WhatsApp

### Actions
1. **Validate prerequisites**:
   - WhatsApp number is configured and active
   - Customer has `WhatsAppConsent = true`
   - `UsageCounters.MessagesUsed < Plan.MessageLimit`
   - `UsageCounters.InvoicesUsed < Plan.InvoiceLimit`

2. **If validation passes**:
   - Generate Invoice PDF (on demand)
   - Send PDF via WhatsApp API (unofficial)
   - Update:
     - `Invoice.Status = Sent`
     - `Invoice.SentAt = now`
   - Increment usage counters:
     - `UsageCounters.MessagesUsed += 1`
     - `UsageCounters.InvoicesUsed += 1`

3. **If validation fails**:
   - Block action
   - Show error message
   - Suggest upgrade (if limit exceeded)

### Validations
- WhatsApp message limit not exceeded
- WhatsApp invoice limit not exceeded
- WhatsApp number is active
- Customer has given explicit consent

### Integration Model
- **Uses unofficial WhatsApp API**
- **BYON (Bring Your Own Number)** model
- Customer owns the WhatsApp number
- Customer assumes ban risk

### Risk Warning
⚠️ **WhatsApp may ban numbers using unofficial APIs**
- Ban can be temporary (24-48h) or permanent
- Customer is responsible for compliance
- Conversation history is preserved if banned
- See `whatsapp-integration.md` for full risk disclosure

---

## 6️⃣ Payment Registration (PAID)

### Trigger
- User manually marks Invoice as paid

### Actions
- Update:
  - `Invoice.Status = Paid`
  - `Invoice.PaidAt = now`
- Update:
  - `Sale.State = PAID`
  - `Customer.CurrentState = PAID`

### Notes
- Payments are manual in MVP
- No online payment processing
- No partial payments in MVP

---

## 7️⃣ Events Emission

For each major step, emit an Event:

- `Conversation.Created`
- `Sale.Created`
- `Invoice.Created`
- `Invoice.Sent`
- `Invoice.Paid`

Events are stored only.
No async processing in MVP.

---

## 8️⃣ State Transition Summary

| From | To |
|----|----|
| LEAD | SALE_CREATED |
| SALE_CREATED | INVOICED |
| INVOICED | PAID |

Invalid transitions must be rejected.

---

## 9️⃣ Forbidden Flows (MVP)

**General:**
- Creating Invoice without Sale
- Recalculating totals in Invoice
- Sending WhatsApp without limit validation
- Marking as Paid without Invoice
- Skipping states

**WhatsApp (Strictly Forbidden):**
- ❌ **Mass messaging**
  - Sending the same invoice to multiple customers
  - Broadcasting messages
  - Campaign-style messaging

- ❌ **Automated messaging**
  - Auto-sending invoices on creation
  - Scheduled message delivery
  - Trigger-based messaging (e.g., auto-reminder)

- ❌ **Bypassing limits**
  - Sending messages when limit is exceeded
  - Resetting counters manually
  - Using multiple WhatsApp numbers to bypass limits

- ❌ **Sending without consent**
  - Messaging customers without `WhatsAppConsent = true`
  - Assuming consent by default
  - Ignoring consent status

**Rationale:**
- These flows increase ban risk
- These flows violate Meta's Terms of Service
- These flows are not part of the MVP scope
- See `whatsapp-integration.md` for full details

---

## 🔟 Final Rule

The **Sale** is the source of truth for money.  
The **Invoice** is a snapshot.  
WhatsApp is the delivery channel.

If the flow is broken at any step,
it is considered a **critical business bug**.
