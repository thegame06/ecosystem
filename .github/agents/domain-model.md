# Domain Model Reference

This project uses **MongoDB** as the persistence layer. The entities are defined as Bson Documents in `SaaS.Domain`.

## Key Entities

### Company (`Company.cs`)
- Represents a tenant in the SaaS.
- **Key Fields**: `Id`, `Name`, `Country` (def: NI), `TaxRate` (def: 0.15), `InvoiceSequence`.

### User (`User.cs`)
- Represents a system user (Employee/Owner).
- **Key Fields**: `Id`, `CompanyId` (Link to Tenant), `Email`, `Role` (Owner, Admin, Seller), `PasswordHash`.

### Conversation (`Conversation.cs`)
- Represents a WhatsApp chat session with a customer.
- **Key Fields**: 
  - `Id`, `CompanyId`, `CustomerId`.
  - `Channel` (default: "WhatsApp").
  - `LastState` (Enum: `CommercialState`).
  - `HasUnreadMessages`.

### Customer (`Customer.cs`)
- Represents a client of a Company.
- **Key Fields**: (Assumed based on naming convention) `Id`, `CompanyId`, `Name`, `Phone`.

### Product (`Product.cs`)
- Item or Service being sold.
- **Key Fields**: (Assumed) `Id`, `CompanyId`, `Name`, `Price`, `Type` (Enum: `ProductType`).

### Sale (`Sale.cs`) & Invoice (`Invoice.cs`)
- **Sale**: Records a transaction.
- **Invoice**: Fiscal document generated from a sale.
- Both link to `CompanyId` and `CustomerId`.

## Enums

### CommercialState (`CommercialState.cs`)
Tracks the lead status in a conversation (e.g., LEAD, NEGOTIATION, CLOSED).

### UserRoles (`UserRoles.cs`)
Defines permissions (e.g., Owner, Admin, Seller).
