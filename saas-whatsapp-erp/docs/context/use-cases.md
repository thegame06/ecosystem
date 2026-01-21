# Use Cases – MVP (WhatsApp-First Sales SaaS)

This document defines the **official MVP use cases**.
Each use case maps directly to application logic.
If a use case is not listed here, it does NOT exist in the MVP.

---

## 1️⃣ Authentication & Access

### UC-01: User Login
**Actor:** User  
**Description:** User logs into the system using email and password.

**Steps:**
1. User submits credentials
2. System validates credentials
3. JWT token is issued

**Rules:**
- User must belong to a Company
- Role determines access

---

## 2️⃣ Company Configuration

### UC-02: Configure Company Settings
**Actor:** Admin / Owner  
**Description:** Configure basic company settings required for sales and invoicing.

**Includes:**
- Country
- TaxRate
- Enable/Disable IVA
- Invoice sequence
- Active plan

---

## 3️⃣ Customers

### UC-03: Create or Update Customer
**Actor:** User  
**Description:** Create a new customer or update an existing one.

**Rules:**
- At least one phone number is required
- WhatsApp consent must be explicit

---

### UC-04: View Customer History
**Actor:** User  
**Description:** View customer sales, invoices and conversations.

---

## 4️⃣ Products

### UC-05: Create or Update Product
**Actor:** Admin  
**Description:** Create or update a product or service.

**Rules:**
- One unit of measure per product
- Base price must be positive
- Type is metadata only

---

### UC-06: Activate / Deactivate Product
**Actor:** Admin  
**Description:** Enable or disable product availability.

---

## 5️⃣ Sales & POS

### UC-07: Create Sale
**Actor:** User  
**Description:** Create a sale from POS or conversation.

**Steps:**
1. Select Customer
2. Add Sale Items
3. Apply discounts
4. Calculate totals

**Rules:**
- Must follow `pricing_calculation_rules.md`
- Quantities > 0
- Discounts validated
- Usage limits checked

---

### UC-08: View Sale
**Actor:** User  
**Description:** View sale details and totals.

---

## 6️⃣ Billing (Invoices)

### UC-09: Generate Invoice
**Actor:** User  
**Description:** Generate an invoice from a sale.

**Rules:**
- Invoice copies Sale totals
- No recalculation allowed
- Sequential invoice number required

---

### UC-10: Send Invoice via WhatsApp
**Actor:** User  
**Description:** Send invoice PDF to customer via WhatsApp.

**Rules:**
- WhatsApp limit validation required
- Invoice status must be Issued

---

### UC-11: Mark Invoice as Paid
**Actor:** User  
**Description:** Manually mark an invoice as paid.

**Rules:**
- No partial payments
- Cannot skip states

---

## 7️⃣ Conversations

### UC-12: View Conversation
**Actor:** User  
**Description:** View WhatsApp conversation with customer.

---

## 8️⃣ Automation & Events

### UC-13: Emit System Events
**Actor:** System  
**Description:** Emit events for key actions.

**Events:**
- Conversation.Created
- Sale.Created
- Invoice.Created
- Invoice.Sent
- Invoice.Paid

**Rules:**
- Events are stored only
- No async workflows in MVP

---

## 9️⃣ Usage & Limits

### UC-14: Validate Usage Limits
**Actor:** System  
**Description:** Validate plan limits before consuming resources.

**Resources:**
- WhatsApp messages
- Conversations
- Invoices
- Users

**Rules:**
- Hard limits
- Action is blocked if exceeded

---

## 🔟 Forbidden Use Cases (MVP)

- Online payments
- Partial payments
- Inventory management
- Unit conversion
- Credit notes
- Public web checkout
- AI-based automation

---

## Final Rule

If a behavior cannot be mapped to one of these use cases,
it must NOT be implemented in the MVP.
