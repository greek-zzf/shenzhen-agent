# Design

<!-- impeccable:design-schema 1 -->

## World

One-colour lawn. The public homepage is objects on a green field, not a max-w-lg app column and not a city magazine. Seed `994252eb` (`sd-seedbed-lobes`).

## Surfaces

- `/` — Persuade. Composition A: three equal situation pills on the green; cream slab is the passport shelf.
- Errand web (`/library`, `/intake`, `/run`, `/me`, `/p/*`, `/login`, `/disclaimer`): same lawn. Green field, white capsule nav (wordmark · Library · Log in / Me), cream slab as the work surface. No bottom tab bar. Operate type scale (not 88px display).

## Color

| Role | Hex |
|---|---|
| Lawn ground | `#82CC5C` |
| Ink | `#2F3130` |
| Capsule / pill | `#FFFFFF` |
| Cream slab | `#EEE8DA` |
| Tomato disc | `#FE6255` |
| Cobalt disc | `#116DE8` |
| Violet disc | `#5D308D` |

Colour lives in the discs, never in the label. Dark/light is not a toggle on this surface: daylight lawn, `color-scheme: light`.

## Type

Poppins 600 display, 500 nav and labels. Flush-left. Display tracking `-0.02em`, line-height `0.95`. Headline max ~18ch. No kicker.

## Components

- Nav: white 999-radius capsule, wordmark left, Log in / Me right.
- Situation pill: white capsule, 999 radius, coloured disc + label. Hover: chip travels 6–8px, 0.4s expo ease-out.
- Cream slab: `border-radius: 48px 48px 0 0`, full bleed, `Start with my passport` as uppercase text link.
- Paper shards: authored SVG, lower right, behind content.

## Motion

One signature: pill/disc travel on hover. Content is visible by default.

## Do not

Do not ship extra nav (Playbooks / Explore / Get started). Do not ship a WeChat mark. Do not invent hours, fees, or audio claims. Do not revert `/` to CopilotChrome.
