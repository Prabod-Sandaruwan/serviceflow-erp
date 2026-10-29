# UI Baseline Checklist: Responsive Layout & Accessibility

Adheres to NFR-USE-001 (Responsive Design) and NFR-USE-002 (Accessibility Baseline).

## 1. Responsive Layout Verification (NFR-USE-001)

### Mobile Viewport (360px - 767px)
- [x] **No Horizontal Scroll**: Page content fits within a 360px viewport width without horizontal overflow.
- [x] **Collapsible Sidebar**: Sidebar is hidden by default (`display: none` / off-canvas).
- [x] **Mobile Navigation Toggle**: Hamburger menu button (`☰`) toggles sidebar drawer.
- [x] **Touch Targets**: Buttons, inputs, and nav links maintain minimum touch-friendly sizes (≥ 44x44px target area).
- [x] **Responsive Form Grids**: Multi-column form layouts and filter bars stack into single columns.
- [x] **Scrollable Tables**: Data tables wrap with `overflow-x: auto` so table contents scroll independently.

### Tablet Viewport (768px - 1279px)
- [x] **Sidebar Visibility**: Sidebar transitions to fixed navigation or stays visible based on viewport.
- [x] **Flexible Grid**: Dashboard cards and metrics adapt into 2-column or 3-column layouts.
- [x] **Form Layouts**: Two-column forms display comfortably without overlapping.

### Desktop Viewport (1280px+)
- [x] **Permanent Sidebar**: Full sidebar navigation rendered with persistent category links.
- [x] **Max Content Widths**: Data tables and content areas use clean container bounds (`maxWidth: 1400px`).
- [x] **Information Density**: Tables and metrics utilize available horizontal space efficiently.

---

## 2. Accessibility Verification (NFR-USE-002 - WCAG 2.1 AA)

### Keyboard Navigation & Focus Order
- [x] **Logical Tab Order**: Tab progression follows logical visual flow (Header -> Navigation -> Main Form -> Submit).
- [x] **Login Page Autofocus**: Email field receives autofocus on mount for immediate keyboard entry.
- [x] **Visible Focus Rings**: All interactive inputs, buttons, and links display clear outline/ring focus states.
- [x] **No Focus Traps**: User can tab forward and backward freely through page controls.

### Forms & Screen Readers
- [x] **Explicit Form Labels**: Every input and select element is bound to a `<label>` via `htmlFor` and `id`.
- [x] **ARIA Error Association**: Invalid inputs use `aria-invalid="true"` and `aria-describedby="{id}-error"`.
- [x] **Live Alerts**: Form submission errors and global messages use `role="alert"` for assistive announcements.

### Modals & Dialogs
- [x] **Native Dialog Element**: Uses `<dialog>` element with semantic `showModal()` and `close()` API.
- [x] **Esc Key Dismissal**: Pressing the `Escape` key fires the `cancel` event and triggers modal close.
- [x] **Modal Focus Trapping**: Keyboard focus is constrained within the dialog when open.
- [x] **Close Button Labeling**: Modal close button explicitly marked with `aria-label="Close modal"`.
