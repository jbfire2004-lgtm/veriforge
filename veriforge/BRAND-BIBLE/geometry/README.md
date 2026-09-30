# Geometry Rules

## No rounded corners anywhere

```ts
GEOMETRY.angularRadius = "0px"
```

- No Tailwind `rounded-*` (except explicit `rounded-none` if required)  
- No CSS `border-radius` other than `0`  
- No pills, chips with radius, or soft avatars as brand pattern  
- Native controls inherit angular geometry via global theme  

**Violation = brand defect.** Debug: `vf-debug-angular` · `npm run vf:debug:angular`

## Angular edges only

- Square cards, buttons, inputs, modals, tags, charts frames  
- Miter joins on icons (`strokeLinejoin: miter`, `strokeLinecap: square`)  
- Hard rules and inset frames — not soft outlines  

## BevelEdge = 6px

```ts
GEOMETRY.bevelEdge = "6px"
```

Use for:

- Press / bevel offset on buttons  
- Edge treatments and bevelShift motion distance language  
- Minimum accent inset rhythm near marks  

Do not invent random bevel sizes (4px / 8px / 12px) without token update.

## CardBevel polygon rules

```ts
GEOMETRY.cardBevel = "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
```

- Default card silhouette is a **rectangle** (fully angular)  
- Clip-path may reference `cardBevel` / `--vf-card-bevel`  
- Do not introduce diagonal “ticket” cuts that clip text or focus rings  
- If a future bevel cut is approved, it must remain polygonal (no curves) and documented here first  

## Layout grid = angular

| Spec | Value |
|------|-------|
| Base unit | 8px |
| Common columns | 12-column mental model · CSS grid on dashboard |
| Gutter | 16px (`SPACING.md`) preferred |
| Debug | `.debug-layout-grid` — steel lines; red = misaligned |

### Grid rules

1. Dashboard uses CSS grid (`VFDashboardGrid`)  
2. Panels/cards use flex for single-axis stacks  
3. Sidebar fixed/sticky — content offset without animating width on every frame  
4. No floating rounded islands off the grid  
5. Reserve chart aspect boxes to protect CLS  

## Focus geometry

- Square controls still need visible focus  
- Prefer `outline` + `outline-offset: 2px` in forge red  
- Do not clip focus with overflow hidden on beveled parents  

## Checklist

- [ ] Zero non-zero radius in touched files  
- [ ] BevelEdge 6px where bevel is used  
- [ ] Card surfaces rectangular / approved polygon  
- [ ] Layout snaps to 8/16 rhythm  
- [ ] Focus ring visible on angular chrome  
