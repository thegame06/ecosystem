# Pricing Calculation Rules

This document defines the ONLY valid way to calculate prices, discounts, taxes, and totals in the system.

---

## Constants & Units
- Quantities must be > 0.
- `basePrice` is the price per unit excluding taxes.
- Calculations must support 2 decimal places with Half-Up rounding.

---

## Line Item Calculation (SaleItem)

1. **Raw Subtotal:** `rawSubtotal = quantity × unitPrice`
2. **Line Discount:** 
   - Apply Fixed or Percentage discount.
   - `discountedSubtotal = rawSubtotal - discountValue` (Fixed) OR `rawSubtotal * (1 - discountValue/100)` (Percentage).
   - Total discount cannot exceed subtotal (no negative subtotals).
3. **Tax Application:**
   - Apply only if `Company.IsTaxEnabled` is true AND `Product.IsTaxable` is true.
   - `taxAmount = discountedSubtotal × Company.TaxRate`.
4. **Line Total:** `lineTotal = discountedSubtotal + taxAmount`.

---

## Sale Totals
- `subtotal = Σ(discountedSubtotals)`
- `taxTotal = Σ(taxAmounts)`
- `total = subtotal + taxTotal`

---

## Invoicing Rules
- Invoices are **snapshots** of Sales.
- **NEVER** recalculate prices or taxes during invoice generation.
- All values must match the Sale record exactly.

---

## Prohibited Actions
- Applying taxes before discounts.
- Negative totals.
- Automatic price assumptions without explicit user input or product definition.
- Skipping the state machine (e.g., Invoicing without a Sale).
