# Feature Spec: Rebranding to Annonai Flow

## Objective
Actualizar la identidad visual y el nombre del sistema para alinearse con la nueva marca **Annonai Flow**, siguiendo los principios de diseño de "Fluid Glass" y la paleta de colores especificada.

---

## Changes

### 1. Visual Identity
- **Name:** "Annonai Flow"
- **Primary Color:** `#0D9488` (Flow Teal)
- **Secondary Surface:** `#0F172A` (Annonai Midnight)

### 2. Frontend Updates (`/frontend/backoffice`)
- **`index.css`**:
    - Update `--color-primary-*` to use Teal scale.
    - Ensure `.glass` and `.glass-dark` are optimized.
- **`Sidebar.tsx`**:
    - Change logo text from "SaaSERP" to "Annonai <span class='text-primary-500'>Flow</span>".
    - Update logo icon container to use Teal.
- **`Layout.tsx`**:
    - Refine background color if needed to match Annonai Midnight or Light Surface.
- **`Navbar.tsx`**:
    - Update profile avatar background to follow brand colors.

---

## Validation
- Sidebar shows "Annonai Flow".
- Primary buttons and active states use Flow Teal (#0D9488).
- UI feels "Fluid" and follows "Premium" aesthetics.
