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
- Generate Invoice PDF (on demand)
- Send PDF via WhatsApp
- Update:
  - `Invoice.Status = Sent`
  - `Invoice.SentAt = now`
- Increment usage counters:
  - Messages
  - Invoices

### Validations
- WhatsApp message limit not exceeded
- WhatsApp number is active

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

- Creating Invoice without Sale
- Recalculating totals in Invoice
- Sending WhatsApp without limit validation
- Marking as Paid without Invoice
- Skipping states

---

## 🔟 Final Rule

The **Sale** is the source of truth for money.  
The **Invoice** is a snapshot.  
WhatsApp is the delivery channel.

If the flow is broken at any step,
it is considered a **critical business bug**.
