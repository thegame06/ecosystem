# Bug: PDF Download Systemic Failure

## 🎯 Context
- **Spec Affected**: `specs/product/prd.md` (Billing section), `specs/tech/architecture.md`.
- **Module**: Backend (Invoice PDF Generation) & Frontend (Download integration).
- **Issue**: PDF downloading is not working across any part of the application.

## ❌ Current Behavior
- When users attempt to download an invoice PDF (from POS, Sales History, or Invoices list), the operation fails.
- Unknown status: Needs investigation to determine if it's a 500 (Generation error), 404 (Route error), or Frontend failure (CORS/Blob handling).

## ✅ Expected Behavior
- Users should be able to download a professional PDF version of any issued invoice.
- The file should have a professional name (e.g., `Factura_INV-001_20240127.pdf`).
- Calculations in the PDF must match the `specs/tech/pricing_rules.md`.

## 🛠️ Investigation Plan
1.  **Backend Check**:
    - Verify `SaaS.Infrastructure.Pdf.QuestPdfGenerator` is correctly implemented.
    - Check if `QuestPDF` license is initialized (it might be throwing an exception if not set to Community).
    - Validate `InvoicesController.GetPdf` logic.
2.  **Frontend Check**:
    - Verify `invoiceService.ts` correctly calls the endpoint.
    - Check if the response is handled as a `blob`.
    - Validate how the browser download is triggered.

## 🏁 Fix Plan
1.  **Backend Fixes**:
    - Updated CORS policy in `Program.cs` to expose `Content-Disposition` header.
    - Added try-catch in `QuestPdfGenerator.cs` and removed explicit `Arial` requirement to ensure robustness.
    - Refactored `MongoIndexes.cs` to prevent startup crashes.
2.  **Frontend Fixes**:
    - Improved `handleDownload` logic in `InvoicesPage.tsx` and `InvoiceModal.tsx` to correctly handle `Blob` objects and normalized headers.
    - Added safety check `response.data instanceof Blob` before URL creation.

## Status
- **Resolved**: All screens now use the updated robust download logic, and the backend correctly exposes necessary metadata.

