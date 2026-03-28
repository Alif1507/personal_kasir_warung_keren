# Design Specification: Indigo Ledger POS

## 1. Design Philosophy: "The Digital Concierge"
The Indigo Ledger UI is built on the concept of a **Digital Concierge**. Unlike traditional, cluttered POS systems, this design prioritizes clarity, high-end editorial aesthetics, and intuitive flows. It aims to reduce cognitive load for the cashier while maintaining a premium feel for the business.

---

## 2. Visual Style & Aesthetics
The visual language is defined by a sophisticated and clean palette, focused on high contrast and purposeful use of space.

*   **Color Palette:**
    *   **Primary:** `#2E44A7` (Deep Indigo) - Used for primary actions, branding, and active states.
    *   **Surface:** `bg-slate-50` / `bg-white` - Provides a clean, airy foundation.
    *   **Accents:** Soft greens for success (`#10B981`), ambers for pending, and reds for failure/low stock.
*   **Shadows & Elevation:** 
    *   We use "Flat Design 2.0" principles—mostly flat surfaces with very subtle, soft shadows (`shadow-sm` or custom low-alpha indigo shadows) to create a sense of layering without clutter.
*   **Border Radius:** 
    *   `rounded-2xl` and `rounded-3xl` are used consistently to soften the interface, making it feel modern and approachable.
*   **Interactive Elements:**
    *   Buttons feature subtle scale-down animations on press (`active:scale-95`) to provide tactile feedback in a touch-first mobile environment.

---

## 3. Typography
Typography is the backbone of the "Editorial" feel. We use **Manrope**, a modern geometric sans-serif that balances functional legibility with a unique personality.

*   **Headlines:** Large, bold, and tracked tight (`tracking-tight`). We use high-contrast sizing (e.g., `text-4xl` for page titles like "History") to create a strong visual hierarchy.
*   **Body Text:** Clean and legible with generous line height.
*   **Metadata:** We use uppercase tracking (`tracking-wider`) and semi-bold weights for secondary information (e.g., "OPERATIONAL RECORDS" or "SKU numbers") to distinguish it from primary data.
*   **Data Points:** Prices and revenue figures are emphasized with bold weights and often slightly larger sizes to ensure they are the first thing a user sees.

---

## 4. Key UI Features & Components

### A. Global Navigation
*   **Top App Bar:** A "Sticky" header that provides constant context (Brand Name/User Profile) and quick actions like notifications.
*   **Bottom Navigation Bar:** A high-contrast, blurred-background (`backdrop-blur`) dock. It uses a mix of icons and labels to ensure clear destination finding. Active states are highlighted with a soft indigo pill background.

### B. Dashboard (Insights)
*   **Revenue Hero Card:** A high-impact gradient card that displays the most critical metric (Daily Revenue) prominently.
*   **Performance Charts:** Integrated `recharts` styling that matches the Indigo theme, providing a quick visual of hourly peaks.
*   **Quick Action Floating Button:** A primary "New Order" (+) button positioned for easy thumb access.

### C. POS (Point of Sale)
*   **Item Grid:** Large, high-quality product imagery with clear "In Stock" indicators.
*   **Quick Cart Summary:** A floating bottom sheet that shows total value and a "View Cart" action, allowing the user to see their progress without leaving the item selection screen.
*   **Search & Filter:** A prominent search bar at the top with category chips for rapid navigation through large catalogs.

### D. Item Management
*   **Stock Status Badges:** Color-coded badges (Green for In Stock, Red for Low/Out) provide immediate inventory awareness.
*   **Actionable Cards:** Each item card includes quick-edit (pencil) and delete (trash) icons, reducing the taps needed for common inventory updates.

### E. Transaction History
*   **Timeline Grouping:** Records are grouped by date (e.g., "Today", "Yesterday") to make searching through past records more natural.
*   **Status Indicators:** Success, Pending, and Failed states are clearly labeled with high-contrast color pills for rapid scanning.

---

*Document generated: March 2026 · Indigo Ledger Design System*
