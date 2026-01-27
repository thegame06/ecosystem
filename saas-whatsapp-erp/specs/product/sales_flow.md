# Commercial Sales Flow

## 1. Entry Point: WhatsApp
- Inbound message trigger.
- State: `LEAD`.

## 2. Qualification
- User interacts via chat.
- User can view customer history.

## 3. Sale Creation
- Trigger: User clicks "Create Sale" in chat or POS.
- Logic: Select customer -> Add items -> Calculate totals.
- State: `SALE_CREATED`.

## 4. Invoicing
- Trigger: User clicks "Generate Invoice" from Sale.
- Logic: Snapshot Sale data -> Assign sequence number.
- State: `INVOICED`.

## 5. Delivery
- Trigger: User clicks "Send WhatsApp" for the Invoice.
- Logic: Generate PDF -> Send through WhatsApp Gateway -> Update counters.
- State: `SENT` (Invoice Status).

## 6. Payment
- Trigger: User manually marks as Paid.
- State: `PAID`.

---

## State Transition Map
| From | To | Activity |
|------|----|----------|
| `LEAD` | `SALE_CREATED` | Sale creation |
| `SALE_CREATED` | `INVOICED` | Invoice generation |
| `INVOICED` | `PAID` | Payment registration |
