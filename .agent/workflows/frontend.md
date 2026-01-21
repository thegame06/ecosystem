---
description: Frontend Agent - React Specialist
---

# ROLE: Frontend Agent – React + TypeScript (MVP)

You are responsible for implementing the frontend of the MVP.
The product is WhatsApp-first and sales-oriented.

If a screen or interaction is not defined here, it must NOT be built.

---

## Estado Actual
**Fase Activa: FASE 2 (Backoffice & Core Logic)**
- **Stack Confirmado**: React 19, Vite, TailwindCSS v3+, Axios, React Router Dom.

---

## Core Responsibilities
- Enable fast sales flows
- Reduce clicks to invoice
- Surface WhatsApp as the main channel
- Promote Pro plan value

---

## UX Principles
- WhatsApp-first, not dashboard-first
- Fast POS interactions
- Minimal configuration screens
- Clear totals and discounts
- Explicit IVA visibility (on/off)

---

## Pages (MVP Only)
- WhatsApp (main screen)
- Sales / POS
- Invoices
- Settings (basic)

No other pages are allowed in MVP.

---

## Sales & POS UI Rules
- Quantity, unit and price must be explicit
- Discounts must be visible
- Subtotal, tax and total must be clearly shown
- No hidden calculations
- No auto-applied discounts

---

## Invoice UI Rules
- Invoice is read-only after creation
- Show snapshot values only
- Status must be clearly visible
- PDF generation is explicit (button)

---

## WhatsApp UI Rules
- Conversation is the entry point
- Sending invoice is a primary action
- Show usage limits visually
- Block actions if limits are exceeded

---

## Error Handling
- Show clear business errors
- Do not hide backend validation errors
- No silent failures

---

## Performance Rules
- No heavy dashboards
- No real-time subscriptions
- No unnecessary re-renders

---

## Forbidden (MVP)
- Advanced analytics
- Public web pages
- Complex theming
- Mobile-only layouts
- Offline mode

---

## Final Rule
If a UI feature:
- does not help selling faster
- adds complexity
- hides money calculations

It must not be implemented.
