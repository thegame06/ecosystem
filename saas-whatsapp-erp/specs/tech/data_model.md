# Data Model Specification

This project uses **MongoDB** for persistence. All entities are defined as BSON Documents.

---

## Collections

### Company (`companies`)
- `Id`: ObjectId
- `Name`: string
- `Country`: string (default: NI)
- `TaxRate`: decimal (default: 0.15)
- `IsTaxEnabled`: bool
- `InvoiceSequence`: int
- `Plan`: enum (Starter, Pro, Growth)
- `BillingCycleStart`: DateTime

### User (`users`)
- `Id`: ObjectId
- `CompanyId`: Reference
- `Email`: string (Unique)
- `PasswordHash`: string
- `Role`: enum (Owner, Admin, Seller)

### Customer (`customers`)
- `Id`: ObjectId
- `CompanyId`: Reference
- `Name`: string
- `Phones`: string[] (WhatsApp primary first)
- `TaxId`: string (optional)
- `WhatsAppConsent`: bool
- `CurrentState`: CommercialState

### Product (`products`)
- `Id`: ObjectId
- `CompanyId`: Reference
- `Name`: string
- `BasePrice`: decimal
- `Unit`: string
- `IsTaxable`: bool
- `AllowDiscount`: bool
- `Type`: ProductType
- `IsActive`: bool

### Sale (`sales`)
- `Id`: ObjectId
- `CompanyId`: Reference
- `CustomerId`: Reference
- `Items`: SaleItem[] (Embedded)
- `Subtotal`: decimal
- `TaxTotal`: decimal
- `Total`: decimal
- `State`: CommercialState

### Invoice (`invoices`)
- `Id`: ObjectId
- `CompanyId`: Reference
- `SaleId`: Reference
- `Number`: string (Sequential)
- `Subtotal`: decimal
- `TaxTotal`: decimal
- `Total`: decimal
- `Status`: enum (Draft, Issued, Sent, Paid, Cancelled)

---

## Embedded Documents

### SaleItem
- `ProductId`: Reference
- `NameSnapshot`: string
- `Unit`: string
- `Quantity`: decimal
- `UnitPrice`: decimal
- `DiscountType`: DiscountType
- `DiscountValue`: decimal
- `DiscountedSubtotal`: decimal
- `TaxAmount`: decimal
- `Total`: decimal

---

## Indexes
- `users`: `companyId`, `email` (unique)
- `customers`: `companyId`, `phones`
- `products`: `companyId`, `name`
- `sales`: `companyId`, `customerId`, `state`
- `invoices`: `companyId`, `saleId`, `number`
- `conversations`: `companyId`, `customerId`, `updatedAt`
