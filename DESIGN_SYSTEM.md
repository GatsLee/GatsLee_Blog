# Swiss Minimalist Design System
## Gats Blog - Design Guidelines

**Style**: Swiss Modernism 2.0
**Philosophy**: Grid-based, typography-focused, high contrast, minimal decoration

---

## Color Palette

### Primary Colors
| Role | Hex | Usage |
|------|-----|-------|
| Background | `#FAFAFA` | Page background |
| Surface | `#FFFFFF` | Cards, sidebar |
| Primary | `#18181B` | Main text |
| Secondary | `#3F3F46` | Secondary text |
| Accent | `#2563EB` | Links, active states, CTAs |
| Border | `#E4E4E7` | Dividers, borders |
| Muted | `#71717A` | Subtle text, labels |
| Foreground | `#09090B` | Headings, emphasis |

### Avoid These Colors (Old Terminal Theme)
- ❌ `#1a1a2e` (old dark background)
- ❌ `#d4a054` (old amber accent)
- ❌ `#2e2e4a` (old borders)
- ❌ `#8888a0` (old text)

---

## Typography

### Font Families
```css
/* Headings */
font-family: 'Archivo', 'Noto Sans KR', sans-serif;

/* Body Text */
font-family: 'Space Grotesk', 'Noto Sans KR', sans-serif;
```

### Type Scale (modular scale with 1.5x ratio)
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 36-48px | 600 | 1.2 |
| H2 | 30-36px | 600 | 1.2 |
| H3 | 24-30px | 600 | 1.3 |
| H4 | 20-24px | 600 | 1.3 |
| Body Large | 18px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Label | 12px | 500 | 1.4 |

### Typography Rules
- Headings use negative letter-spacing: `tracking-tight` (-0.02em)
- Labels use wide tracking: `tracking-wider` or `tracking-[0.2em]`
- Body text: 1.6 line-height for readability
- Max line length: 65-75 characters (`max-w-prose` or `max-w-3xl`)

---

## Spacing System

**Base unit**: 8px (Tailwind's default spacing scale)

### Common Spacing Values
- `gap-8` (32px) - Between components
- `gap-12` (48px) - Between sections (mobile)
- `gap-16` (64px) - Between sections (desktop)
- `gap-24` (96px) - Between major sections
- `px-6 py-6` - Sidebar padding
- `px-8 py-8` - Content section padding
- `px-12 py-12` - Page container padding

---

## Grid System

### 12-Column Grid
```jsx
<div className="grid grid-cols-12 gap-8">
  <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
    {/* Centered content with breathing room */}
  </div>
</div>
```

### Layout Widths
- Max content width: `max-w-7xl` (1280px)
- Centered layouts: `mx-auto`
- Asymmetric grids encouraged for visual interest

---

## Components

### Buttons & Links
```jsx
/* Primary Link */
<Link className="text-[#2563EB] hover:underline font-medium cursor-pointer">

/* Navigation Item (Active) */
<Link className="bg-[#09090B] text-[#FAFAFA] px-4 py-3 rounded cursor-pointer">

/* Navigation Item (Inactive) */
<Link className="text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] px-4 py-3 rounded cursor-pointer">
```

### Cards
```jsx
/* Minimal card with left border accent */
<div className="border-l-2 border-[#09090B] pl-6 py-2">

/* Hoverable post card */
<Link className="group block border-l-2 border-transparent hover:border-[#2563EB] pl-8 py-4 transition-all duration-200 cursor-pointer">
```

### Borders
- Use minimal borders: `border-[#E4E4E7]`
- Accent borders: `border-l-2 border-[#09090B]` or `hover:border-[#2563EB]`
- Avoid: rounded borders, dark borders, heavy borders

---

## Interactions

### Transitions
```css
/* Standard transition */
transition-all duration-200

/* Color transitions only */
transition-colors duration-200

/* Transform transitions */
transition-transform duration-200
```

### Hover States
- Text color change: `hover:text-[#2563EB]`
- Background: `hover:bg-[#F4F4F5]`
- Border reveal: `border-transparent hover:border-[#2563EB]`
- Transform: `group-hover:translate-x-1`

### Focus States
- Always include `aria-label` for icon-only buttons
- Ensure visible focus rings for keyboard navigation

---

## Accessibility

### Contrast Ratios
- Body text on light bg: `#18181B` on `#FAFAFA` = 16:1 ✓
- Small text minimum: 4.5:1
- Large text minimum: 3:1

### Best Practices
- ✓ All icons have `strokeWidth={1.5}` for consistency
- ✓ All buttons have `cursor-pointer`
- ✓ Smooth transitions: 150-200ms (respects `prefers-reduced-motion`)
- ✓ Semantic HTML: use `<time>`, `<nav>`, `<article>`
- ✓ ARIA labels for icon-only buttons

---

## Anti-Patterns (Never Do This)

### Visual
- ❌ Using emojis as icons (use Lucide icons instead)
- ❌ Dark backgrounds or terminal-style boxes
- ❌ Amber (`#d4a054`) or green accents
- ❌ Heavy borders or gradients
- ❌ Rounded corners > 4px (use `rounded` or no rounding)

### Typography
- ❌ Monospace fonts except for code blocks
- ❌ Font sizes not from the modular scale
- ❌ Tight line-height for body text (< 1.5)
- ❌ Excessive font weights (only 300, 400, 500, 600, 700)

### Layout
- ❌ Inconsistent spacing (not using 8px grid)
- ❌ Full-width text blocks (> 75ch)
- ❌ Cluttered layouts without whitespace

---

## Implementation Checklist

Before shipping a new component:

- [ ] Uses Archivo for headings, Space Grotesk for body
- [ ] Colors from approved palette only
- [ ] Spacing follows 8px grid system
- [ ] Contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states with smooth transitions (200ms)
- [ ] Icons from Lucide with `strokeWidth={1.5}`
- [ ] ARIA labels where needed
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No layout shift (CLS = 0)

---

## Responsive Breakpoints

```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## Code Examples

### Page Layout
```tsx
<div className="max-w-7xl mx-auto animate-fadeIn">
  <div className="grid grid-cols-1 gap-16 md:gap-24">
    <section className="grid grid-cols-12 gap-8">
      <div className="col-span-12 md:col-span-10 md:col-start-2">
        {/* Content */}
      </div>
    </section>
  </div>
</div>
```

### Typography Styles
```tsx
/* Heading */
<h2
  className="text-3xl md:text-4xl text-[#09090B] font-semibold tracking-tight mb-3"
  style={{ fontFamily: 'Archivo, sans-serif' }}
>

/* Label */
<p className="text-xs text-[#71717A] uppercase tracking-[0.2em] font-medium">

/* Body */
<p className="text-[#18181B] leading-relaxed text-base md:text-lg">
```

---

**Last Updated**: 2024-02-14
**Maintained By**: Claude Code UI/UX Pro Max
