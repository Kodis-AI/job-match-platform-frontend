# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** MatchAI
**Generated:** 2026-11-11 10:01:36
**Category:** Resume / CV Builder
**Design Dials:** Density 5/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#1E3A5F` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#2563EB` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#16A34A` | `--color-accent` |
| On Accent/CTA | `#000000` | `--color-on-accent` |
| Background | `#F8FAFC` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#0F172A` | `--color-card-foreground` |
| Muted | `#E9EEF5` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#CBD5E1` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#1E3A5F` | `--color-ring` |

**Color Notes:** Professional navy + section accent + success green

### Typography

- **Heading Font:** Poppins
- **Body Font:** Open Sans
- **Mood:** modern, professional, clean, corporate, friendly, approachable
- **Google Fonts:** [Poppins + Open Sans](https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

### Spacing Variables

*Density: 5/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #16A34A;
  color: #000000;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1E3A5F;
  border: 2px solid #1E3A5F;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #1E3A5F;
  outline: none;
  box-shadow: 0 0 0 3px #1E3A5F20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Minimalism & Swiss Style

**Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential

**Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools

**Key Effects:** Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Page Pattern

**Pattern Name:** Product Demo + Features

- **Conversion Strategy:** Use an interactive demo only when it explains value better than static media. Provide captions, transcript, visible play/pause controls, and a non-video fallback; do not autoplay under reduced motion. Pause media when offscreen or hidden and keep the final product state available as static content.
- **CTA Placement:** Video center + CTA right/bottom
- **Section Order:** Hero > Product video/mockup (center) > Feature breakdown per section > Comparison (optional) > CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ No live preview
- ❌ weak ATS signals
- ❌ decorative clutter

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Implementación React Native (MatchAI)

> Sección añadida a mano. El código fuente de verdad está en `src/theme/`; si cambias un token, actualízalo en ambos sitios.

### Uso
```js
import { makeStyles, useTheme } from '../theme';
const useStyles = makeStyles((t) => ({
  card: { backgroundColor: t.colors.card, padding: t.spacing.md, ...t.typography.body },
}));
```
- Nunca uses hex directos en componentes o pantallas: solo `t.colors.*`.
- El tema sigue el modo del sistema (`useColorScheme`, `app.json → userInterfaceStyle: "automatic"`).

### Tokens oscuros (derivados; contraste verificado ≥ 4.5:1 en texto)
| Token | Claro | Oscuro |
|-------|-------|--------|
| background | `#F8FAFC` | `#0B1220` |
| card | `#FFFFFF` | `#111A2E` |
| foreground | `#0F172A` | `#F1F5F9` |
| muted / mutedForeground | `#E9EEF5` / `#475569` | `#1E293B` / `#94A3B8` |
| border / inputBorder | `#CBD5E1` / `#64748B` | `#334155` / `#64748B` |
| primary / onPrimary | `#1E3A5F` / `#FFFFFF` | `#60A5FA` / `#0B1220` |
| secondary / secondaryText | `#2563EB` / `#1D4ED8` | `#93C5FD` / `#93C5FD` |
| accent / onAccent | `#16A34A` / `#000000` | `#22C55E` / `#000000` |
| success (texto) | `#15803D` | `#4ADE80` |
| warning (texto) | `#B45309` | `#FBBF24` |
| destructive | `#DC2626` | `#F87171` |

> `accent` (#16A34A) **no** sirve como color de texto sobre blanco (3.3:1). Para texto de éxito usa `success`.

### Roles de color
- **primary (marino):** marca, encabezado, tarjeta "Match general", números de paso.
- **secondary (azul):** enlaces, chips activos, barras de progreso, zonas de carga.
- **accent (verde, texto negro):** solo CTA principales ("Evaluar compatibilidad", "Generar CV").
- **success / warning:** estados (Listo, Ausente, banner de resultado).

### Tipografía (React Native)
Cada peso es una familia: `Poppins_600SemiBold`, `Poppins_700Bold`, `OpenSans_400Regular`, `OpenSans_600SemiBold`, `OpenSans_700Bold`. No combines `fontFamily` con `fontWeight`.
Escala: display 48 · h1 30 · h2 24 · h3 20 · title 18 · subtitle/body 16 · bodySm 14 · caption/label 12 (**mínimo absoluto**).

### Reglas de componentes
- Iconos: `@react-native-vector-icons/lucide` mediante `<Icon />` (decorativo por defecto; pasa `label` si transmite información). Nada de emoji ni Unicode como icono.
- Áreas táctiles ≥ 44px (`t.touch.min`); CTA grandes 52px.
- Todo lo que parezca pulsable es `Pressable` con `accessibilityRole`, estado pressed (opacidad 0.82) y acción real o aviso "próximamente".
- Sombras solo en modo claro (`t.shadows.sm|md`); en oscuro se diferencia por superficie y borde.
- Respeta las áreas seguras con `useSafeAreaInsets()`.
