# Design system

## Status

This document records the current frontend implementation. The product name and brand identity are undecided; “Social” and the geometric mark are provisional interface labels, not an established identity.

## Product and interface

The product is a general-purpose network for personal and professional connections. Its primary experience is a familiar, feed-first social interface: members discover people, manage connections, choose post visibility, and respond to posts. The UI must stay within capabilities backed by the API and must not invent people, activity, or engagement.

The visual direction is clear and familiar rather than domain-specific: a blue action color, neutral reading surfaces, compact navigation, rounded cards, and a responsive profile/feed/connections frame. The composer makes its audience choice visible beside the publishing action.

## Foundations

### Color

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#f2f5fa` | `#111925` |
| Surface | `#ffffff` | `#192434` |
| Raised surface | `#f8faff` | `#202e40` |
| Primary text | `#19283d` | `#eef3fb` |
| Muted text | `#68788e` | `#b6c2d2` |
| Subtle text | `#8795a8` | `#93a2b7` |
| Border | `#e2e8f1` | `#2c3a4d` |
| Primary blue | `#2868e8` | `#76a4ff` |
| Strong blue | `#1d55ca` | `#9bbaff` |
| Pale blue | `#edf3ff` | `#243654` |
| Teal | `#087e80` | `#5dc7c2` |
| Danger | `#b63843` | `#ff9a9e` |

Theme-specific colors are defined in `app/globals.css`. Use the semantic CSS variables rather than hard-coded colors in components.

### Typography

Use the platform system sans-serif stack. Body copy is 15px with a 1.55 line height; supporting labels and navigation are smaller and muted. Headings use strong weight and tight tracking rather than a separate display typeface.

### Shape and elevation

Cards use a 15px radius, a subtle border, and a low-contrast shadow. Inputs and navigation controls use roughly 10px radii; the composer and profile surfaces use slightly larger radii. Avoid heavy shadows and high-contrast dividers.

## Layout and components

- A sticky shared header provides the provisional wordmark, search entry, account actions, and primary navigation.
- The authenticated feed uses a responsive profile/feed/connections composition, with the post composer before the latest API-backed posts.
- Post cards group author and visibility metadata, content/media, engagement counts, and reaction/comment/share actions.
- Profiles and discovery surfaces reuse the same cards, avatars, connection actions, and navigation conventions.
- Registration, login, profile editing, friend requests, and post interactions surface validation and API errors inline.
- At narrow widths, multi-column content collapses into a single readable column and navigation adapts to available space.

## Interaction and accessibility

- Respect the backend visibility values: public, friends, and only me. Keep the selected audience visible in the composer and on posts.
- Use semantic controls and labels, visible keyboard focus, accessible names for icon-only actions, and status/alert roles for asynchronous feedback.
- Disabled actions communicate why they are unavailable; avoid implying unsupported messaging or notification features.
- Theme changes preserve readable foreground/background contrast in both light and dark modes.

## Source of truth

`app/globals.css` owns theme tokens, shared layout, responsive breakpoints, and component styling. Reuse the components under `components/` and API-backed models/services under `lib/` and `services/`. Update this document and `.impeccable/design.json` when the implemented system materially changes.
