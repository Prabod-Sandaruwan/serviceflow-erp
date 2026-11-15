# PDF Visual Quality and Authorization Checklist

This document verifies the visual layout quality, cross-viewer rendering consistency, authorization scoping, and error handling for generated ServiceFlow ERP PDF documents (Invoices and Quotations), fulfilling task PDF-004.

## Section 1: Error Handling & Authorization
- [x] API returns standard JSON 404 error (not a corrupt/partial PDF) when an invalid Invoice/Quotation ID is requested.
  - *Verification*: Non-existent IDs return `{ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } }` with HTTP status 404 and `content-type: application/json`.
- [x] API returns standard JSON 403 error when a `STAFF` user attempts to download a PDF they do not have access to.
  - *Verification*: Tested in `server/tests/integration/invoices.pdf.test.ts`. Unassigned staff members querying `/api/v1/invoices/:id/pdf` receive 403 `FORBIDDEN` JSON with no stream piped.
- [x] Ensure middleware intercepts errors before `pdfkit` starts piping to the HTTP response.
  - *Verification*: Handlers execute database retrieval, authorization guards, and validation before setting stream headers or invoking PDF generation, ensuring clean error responses.

## Section 2: Visual & Layout Quality (Cross-Viewer)
- [x] PDF opened and verified in at least two different viewers (e.g., Chrome built-in viewer and Adobe Acrobat / Edge).
  - *Verification*: Generated PDFs (`test-long-invoice.pdf` and quotation PDFs) load cleanly in Chrome PDF Viewer and Microsoft Edge / Adobe Acrobat without rendering warnings or corrupt stream flags.
- [x] Fonts render correctly with accurate weights (e.g., Bold for headers) and Unicode characters.
  - *Verification*: Standard Helvetica, Helvetica-Bold, and Helvetica-Oblique render sharp typography across viewports. Currency amounts, bullets (`•`), and symbols display cleanly.
- [x] Company configuration (Name, Address) from `.env` appears correctly at the top.
  - *Verification*: Dynamically populated from `COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_PHONE`, `COMPANY_EMAIL`, and `COMPANY_WEBSITE` via `drawCompanyHeader()`. Verified in `pdf-layout.test.ts`.
- [x] Page numbers and Document Number are correctly positioned in the footer on every page.
  - *Verification*: Drawn via `doc.bufferedPageRange()` across all pages (`Page X of Y`). Audit bar and reference codes align above the bottom margin on every page.

## Section 3: Acceptance Criteria Verification
- [x] Long descriptions wrap correctly within the column constraints.
  - *Verification*: Verified with 416-character continuous text in `pdf-page-breaks.test.ts` and `pdf-long-content.ts`. Text wraps cleanly within the 250pt column limit.
- [x] **Absolutely NO clipped text at page edges.**
  - *Verification*: Table rows calculate dynamic height via `measureRowHeight` and trigger `checkPageBreak`, strictly preserving page margins.
- [x] Subtotal, Tax, Total, and Balance are kept together and aligned to the right.
  - *Verification*: The summary block checks required height (`120pt-150pt`) and forces a clean page break if remaining height is insufficient, preventing orphaned totals.
- [x] Totals on the PDF perfectly match the totals shown on the UI screen.
  - *Verification*: PDF values formatted via `formatAmount` match client-side currency formatters (`$1,234.56`) and database precision. Automated in `pdf.test.ts`.
