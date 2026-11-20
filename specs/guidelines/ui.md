# UI

Plain and readable. No design work: no illustrations, animations, shadows or custom fonts.

## Tokens

All tokens live in one file, `packages/app/src/tokens.css`, as CSS custom properties:

| Group         | Tokens                                                                |
| ------------- | --------------------------------------------------------------------- |
| Colors        | `--color-*`                                                           |
| Spacing scale | `--space-1` to `--space-7`                                            |
| Radius        | `--radius`                                                            |
| Type scale    | `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--line-height` |
| System font   | `--font`                                                              |

## Rules

Each rule names its check.

1. **Tokens in one place.** There is exactly one `tokens.css`, and it defines the colors, the spacing scale, the radius, the type scale and the system font.
   Check: `scripts/guidelines.test.ts`, "tokens.css is the single token file and defines exactly one green".
2. **One green, and it means entry is open.** `--color-open` is the only green token. It is used only to show that entry is open.
   Check: the same test verifies there is one green token; `grep -rn "color-open" packages/app/src` lists every use for review.
3. **No raw hex value and no raw pixel spacing in a component.** Outside `tokens.css`, no file in `packages/app/src` contains a hex color or a `px`, `rem` or `em` length; components use `var(--...)`. The condition of an `@media` line is the one exception, because CSS variables do not work there.
   Check: `scripts/guidelines.test.ts`, "raw hex colors and raw pixel values appear only in tokens.css".
4. **The font is the system font.** `font-family` is set once, on `body`, to `var(--font)`.
   Check: `grep -rn "font-family" packages/app/src` returns one line.
5. **Every screen works at 390 px and 1440 px wide**: no horizontal scrolling, no clipped or overlapping text.
   Check: `bun scripts/shot.ts {nr}` writes `screen-390.png` and `screen-1440.png` into `specs/{nr}-{name}/evidence/`; both are reviewed.
