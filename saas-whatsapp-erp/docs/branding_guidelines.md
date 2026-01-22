# BRANDING GUIDELINES – ANNONAI FLOW

## 1. Product Identity

**Product Name:** Annonai Flow  
**Tagline:** "Conversations that convert." / "Fluidez para tu negocio."  
**Ecosystem:** Annonai (Global Brand)

### Concept
**Annonai Flow** represents the seamless movement of business: from a chat message -> to a sale -> to money in the bank. It removes friction. It is the liquid state of commerce.

### Future Ecosystem
The Annonai family expands to cover specific business needs:
- **Annonai Flow** (Core): Sales, CRM & WhatsApp.
- **Annonai Books** (Future): Accounting, Tax & Compliance.
- **Annonai Teams** (Future): HR & Payroll.


---

## 2. Color Palette

We move away from "Generic Tech Blue" or "Standard WhatsApp Green".
We use a **bi-chromatic premium theme**: Deep Ocean (Annonai) + Vibrant Success (Flow).

### Primary Brand Colors
- **Annonai Midnight**: `#0F172A` (Rich, deep blue-grey for backgrounds/headers) - *Existing Surface-900*
- **Flow Teal**: `#0D9488` (Primary Brand Color - distinctive, professional, trustworthy)
- **WhatsApp Action**: `#22C55E` (Reserved SPECIFICALLY for "Send to WhatsApp" actions to maintain familiarity)

### Accent Colors
- **Pulse Coral**: `#F43F5E` (For acute calls to action, errors, or critical alerts)
- **Glass White**: `rgba(255, 255, 255, 0.7)` (For glassmorphism effects)

### Semantic Palette
- **Success/Money**: `#10B981` (Emerald) - *Use for paid invoices, money received*
- **Pending/Action**: `#F59E0B` (Amber) - *Use for drafts, pending confirmation*
- **Error/Danger**: `#EF4444` (Red) - *Use for cancellations, dangerous zones*

---

## 3. Typography

**Headings:** `Plus Jakarta Sans` or `Outfit`
*Modern, geometric, approachable but tech-forward.*

**Body/UI:** `Inter` or `Geist Sans`
*Clean, highly legible, familiar.*

**Monospaced:** `JetBrains Mono` or `Fira Code`
*For invoice numbers, transaction IDs, code snippets.*

---

## 4. UI Design Language: "Fluid Glass"

The UI should feel lighter than air. Avoid heavy solid blocks.

### Key Characteristics
1.  **Glassmorphism**: Use highly blurred translucent backgrounds for cards and modals (`backdrop-blur-md`).
2.  **Soft Shadows**: Deep, diffuse shadows (`shadow-xl` with low opacity colors) instead of harsh outlines.
3.  **Rounded Corners**: Generous border radius (`rounded-2xl` for cards, `rounded-xl` for buttons).
4.  **Micro-Interactions**: everything interactive should scale slightly (`scale-[1.02]`) on hover.

### Component Styling
*   **Buttons**: Gradient backgrounds for primary actions. `bg-gradient-to-r from-teal-600 to-emerald-500`.
*   **Inputs**: Minimalist borders, emphasize background color change on focus.
*   **Cards**: White with 70% opacity + blur on light mode. Black with 70% opacity on dark mode.

---

## 5. Logo & Iconography

*   **Logo Concept**: An abstract "Flow" symbol (like a wave or a loop) intertwining with a chat bubble.
*   **Icons**: Using `Lucide React` (Stroke width: 1.5px or 2px). Rounded finish.

---

## 6. Tone of Voice

*   **Professional yet Close**: "Hola, aquí está tu factura" (Not "Factura Generada").
*   **Encouraging**: "¡Gran venta!" upon closing a deal.
*   **Clear**: No technical jargon visible to the end user.
