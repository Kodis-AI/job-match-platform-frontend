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
| Primary | `#4F46E5` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#0284C7` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#4F46E5` | `--color-accent` |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` |
| Background | `#F8F7FF` | `--color-background` |
| Foreground | `#17172A` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#17172A` | `--color-card-foreground` |
| Muted | `#EEF0FF` | `--color-muted` |
| Muted Foreground | `#5B6078` | `--color-muted-foreground` |
| Border | `#D9DDF0` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#4F46E5` | `--color-ring` |

**Color Notes:** Indigo/lavender brand + blue secondary accent + semantic success green

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
  background: #4F46E5;
  color: #FFFFFF;
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
  color: #4338CA;
  border: 2px solid #4338CA;
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

### Compatibility Results

- Place the overall match score in a soft primary/lavender card with a circular progress ring and centered percentage.
- On wide screens, show the overall score beside a vertical list of competency rows; stack them on narrow screens.
- Each competency row includes its label, score, progress bar, and a short explanation. Use semantic palette tokens for row colors; reserve green for success states.

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
  border-color: #4F46E5;
  outline: none;
  box-shadow: 0 0 0 3px #4F46E520;
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
| background | `#F8F7FF` | `#11111F` |
| card | `#FFFFFF` | `#1B1B2E` |
| foreground | `#17172A` | `#F4F3FF` |
| muted / mutedForeground | `#EEF0FF` / `#5B6078` | `#292940` / `#A7A8C2` |
| border / inputBorder | `#D9DDF0` / `#9AA2BD` | `#41415D` / `#777894` |
| primary / onPrimary | `#4F46E5` / `#FFFFFF` | `#A5A0FF` / `#17152F` |
| secondary / secondaryText | `#0284C7` / `#0369A1` | `#38BDF8` / `#7DD3FC` |
| accent / onAccent | `#4F46E5` / `#FFFFFF` | `#A5A0FF` / `#17152F` |
| success (texto) | `#059669` | `#34D399` |
| warning (texto) | `#B45309` | `#FBBF24` |
| destructive | `#DC2626` | `#F87171` |
| destructiveSoft / destructiveBorder | `#FEF2F2` / `#FECACA` | `#3A1518` / `#7F1D1D` |
| destructiveText (sobre destructiveSoft) | `#B91C1C` (5.9:1) | `#FCA5A5` (8.5:1) |

> El verde se reserva para estados de éxito. Para acciones y textos de marca usa los tokens primary/accent.

### Roles de color
- **primary (índigo):** marca, encabezado, tarjeta "Match general", números de paso y acciones principales.
- **secondary (azul):** enlaces, chips activos, barras de progreso y zonas de carga.
- **accent (índigo):** CTA principales ("Evaluar compatibilidad", "Generar CV").
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

### Formularios y autenticación
- Campos: `TextField` (`src/components/TextField.js`) con etiqueta visible, altura ≥ 48px, borde `inputBorder` → `ring` al enfocar y error en línea con icono + `destructiveText`, anunciado (`accessibilityLiveRegion`).
- Contraseñas: siempre con botón mostrar/ocultar (44px). En registro, checklist de requisitos en vivo (icono `success` + texto `foreground`; `success` a 12px no alcanza 4.5:1 sobre `card`).
- Errores de envío: `FormAlert tone="error"` arriba del formulario; validación en blur y al enviar, moviendo el foco al primer campo inválido.
- Pantallas de acceso: `AuthLayout` — dos columnas (panel de marca `primarySoft` + tarjeta) desde 900px; una columna centrada (máx. 460px) por debajo.
