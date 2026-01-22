# Domain Model Reference

This project uses **MongoDB** as the persistence layer.
All entities are defined as **BSON Documents** in `SaaS.Domain.Documents`.

This document is the **source of truth** for the domain model.
If a field or entity is not defined here, it does not exist in the MVP.

---

## Key Entities

### Company (`Company.cs`)
Represents a tenant in the SaaS.

**Key Fields**:
- `Id`
- `Name`
- `Country` (default: `NI`)
- `TaxRate` (default: `0.15`)
- `IsTaxEnabled` (allows sales/invoices without IVA)
- `InvoiceSequence`
- `Plan` (`Starter`, `Pro`, `Growth`)
- `BillingCycleStart`
- `CreatedAt`

---

### User (`User.cs`)
Represents a system user (Owner / Employee).

**Key Fields**:
- `Id`
- `CompanyId` (Tenant reference)
- `Email`
- `PasswordHash`
- `Role` (`Owner`, `Admin`, `Seller`)
- `CreatedAt`

---

### Customer (`Customer.cs`)
Represents a client of a Company.

**Key Fields**:
- `Id`
- `CompanyId`
- `Name`
- `Phones` (one or more, WhatsApp primary first)
- `TaxId` (optional)
- `WhatsAppConsent` (bool)
- `CurrentState` (`CommercialState`)
- `CreatedAt`

---

### Conversation (`Conversation.cs`)
Represents a WhatsApp chat session with a customer.

**Key Fields**:
- `Id`
- `CompanyId`
- `CustomerId`
- `Channel` (default: `WhatsApp`)
- `LastState` (`CommercialState`)
- `LastMessage`
- `HasUnreadMessages`
- `UpdatedAt`

---

### Product (`Product.cs`)
Represents a product or service that can be sold.

**Key Fields**:
- `Id`
- `CompanyId`
- `Name`
- `BasePrice` (price per unit, without tax)
- `Unit` (Unit, Hour, Day, Kg, etc.)
- `IsTaxable`
- `AllowDiscount`
- `Type` (`Tangible`, `Service`, `Rental`)
- `IsActive`
- `CreatedAt`

Notes:
- One unit per product
- No unit conversion in MVP
- Rental type is metadata only (no calendar logic)

---

### Sale (`Sale.cs`)
Represents a commercial transaction.

**Key Fields**:
- `Id`
- `CompanyId`
- `CustomerId`
- `Items` (`SaleItem[]`)
- `PaymentMethod` (`Cash`, `Transfer`, `Card`)
- `Subtotal`
- `TaxTotal`
- `Total`
- `State` (`CommercialState`)
- `CreatedAt`

Sale totals MUST follow `pricing_calculation_rules.md`.

**Payment Methods**:
- `Cash` - Efectivo
- `Transfer` - Transferencia bancaria
- `Card` - Tarjeta de crédito/débito

---

### SaleItem (`SaleItem.cs`)
Embedded document inside `Sale.Items`.

**Key Fields**:
- `ProductId`
- `NameSnapshot`
- `Unit`
- `Quantity`
- `UnitPrice`
- `DiscountType` (`None`, `Fixed`, `Percentage`)
- `DiscountValue`
- `DiscountedSubtotal`
- `TaxAmount`
- `Total`

---

### Invoice (`Invoice.cs`)
Represents a fiscal document generated from a Sale.

**Key Fields**:
- `Id`
- `CompanyId`
- `SaleId`
- `Number`
- `Subtotal`
- `TaxTotal`
- `Total`
- `Status` (`Draft`, `Issued`, `Sent`, `Paid`, `Cancelled`)
- `SentAt`
- `PaidAt`
- `CreatedAt`

Notes:
- Invoice is a snapshot
- Invoice MUST NOT recalculate prices

---

### UsageCounters (`UsageCounters.cs`)
Tracks monthly usage for plan limits.

**Key Fields**:
- `Id`
- `CompanyId`
- `Period` (`YYYY-MM`)
- `MessagesUsed`
- `ConversationsUsed`
- `InvoicesUsed`
- `UsersUsed`
- `CreatedAt`

---

### WhatsAppNumber (`WhatsAppNumber.cs`)
Represents a WhatsApp number connected to a Company.

**Key Fields**:
- `Id`
- `CompanyId`
- `PhoneNumber`
- `ProviderType` (`BYON`, `External`)
- `IsActive`
- `CreatedAt`

---

### Event (`Event.cs`)
Stores system events for audit and automation.

**Key Fields**:
- `Id`
- `CompanyId`
- `Type` (e.g. `Sale.Created`, `Invoice.Sent`)
- `EntityType`
- `EntityId`
- `Payload`
- `CreatedAt`

---

## Enums

### CommercialState (`CommercialState.cs`)
Tracks the commercial lifecycle.

Values:
- `LEAD`
- `SALE_CREATED`
- `INVOICED`
- `PAID`

---

### UserRoles (`UserRole.cs`)
Defines user permissions.

Values:
- `Owner`
- `Admin`
- `Seller`

---

### ProductType (`ProductType.cs`)
Defines product nature.

Values:
- `Tangible`
- `Service`
- `Rental`

---

### DiscountType (`DiscountType.cs`)
Defines discount calculation.

Values:
- `None`
- `Fixed`
- `Percentage`

---

### PaymentMethod (`PaymentMethod.cs`)
Defines payment method for sales.

Values:
- `Cash` - Efectivo
- `Transfer` - Transferencia bancaria
- `Card` - Tarjeta de crédito/débito

---

## Domain Rules

- `CompanyId` is mandatory in all documents
- No price recalculation outside Sale creation
- Invoice mirrors Sale values
- WhatsApp actions must validate usage limits
- If it is not defined here, it is not part of the MVP
