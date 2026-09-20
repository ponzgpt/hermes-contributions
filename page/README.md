# Hermes Agent — landing page

An unofficial landing page for [Hermes Agent](https://github.com/NousResearch/hermes-agent),
the open-source agent by Nous Research. Live at <https://hermes-agent.technoir.cloud>.

The idea it borrows from [omarchy.dacton.com/11-etch](https://omarchy.dacton.com/11-etch/) is
that the page should behave like the thing it is selling: press <kbd>/</kbd> and you get the
agent's real slash-command palette, press <kbd>s</kbd> and the page repaints in the next of the
six skins the CLI actually ships. None of Omarchy's content, colours or type came along — the
palette is Nous blue, the display face is a Didone, and every fact on the page comes from the
Hermes docs, README and CLI reference.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
```

There is no build step. `index.html` plus the files in `assets/` are the whole site; drop them
on any static host.

```bash
npm test         # vitest, jsdom
npm run lint     # eslint
npm run check    # lint + format check + tests
```

## Layout

| Path                      | What it is                                                    |
| ------------------------- | ------------------------------------------------------------- |
| `index.html`              | Every section. Readable and complete without JavaScript.      |
| `assets/css/style.css`    | One sheet. All colour comes from four custom properties.      |
| `assets/js/skins.js`      | The six skins, and applying/remembering/linking one.          |
| `assets/js/commands.js`   | The slash commands and shortcuts, and the palette's matching. |
| `assets/js/settle.js`     | The headline resolving out of noise.                          |
| `assets/js/transcript.js` | Typing a session into a `<pre>`.                              |
| `assets/js/site.js`       | Wiring only — no logic worth testing lives here.              |
| `tests/`                  | Unit tests for the four modules above.                        |

## Keyboard

| Key            | Does                              |
| -------------- | --------------------------------- |
| <kbd>/</kbd>   | Open the command palette          |
| <kbd>?</kbd>   | Show the CLI's keyboard shortcuts |
| <kbd>s</kbd>   | Next skin                         |
| <kbd>esc</kbd> | Close whatever is open            |

A skin can also be linked: `/?skin=ember`.

## Design tokens

The page is drawn on Nous's own scale. Their site sizes everything in `calc(N * var(--u))`
where `--u` is one part in 2360 of the viewport, so `style.css` does the same, with a floor
so it stays legible on a phone. Their measured roles: eyebrow 18u, body 21u, nav 26u, h2 72u,
h1 132u; display caps at +0.03em tracking, h1 at 0.88 line-height, 4px radius, and a little
grain over the flat ground.

| Token      | Value     | Source                       |
| ---------- | --------- | ---------------------------- |
| background | `#0000f2` | Nous `--color-hermes`        |
| foreground | `#f5f5f5` | Nous `--color-hermes-fg`     |
| accent     | `#edff45` | Nous `--color-hermes-accent` |

## Skins

`nous`, `mono`, `slate`, `cyberpunk`, `midnight`, `ember` — the names Hermes ships as built-in
skins for `/skin`. `nous` carries the three published tokens above; the other five are this
page's reading of names the product ships without published palettes. `tests/contrast.test.js`
holds every text role in every skin above 4.5:1, which is the floor Hermes' own skin guidance
asks for.

## Accuracy

Every claim, heading and label on the page is Nous's own wording. Copy, version numbers,
command names, platform lists and counts come from
[the docs](https://hermes-agent.nousresearch.com/docs/), the
[CLI reference](https://hermes-agent.nousresearch.com/docs/user-guide/cli/) and the repository
README, as of September 2026. The four Bot Mode profiles in the roster section are illustrative
examples of what a roster looks like, not shipped presets.

Fonts are Bodoni Moda and Courier Prime from Google Fonts. Not affiliated with Nous Research.
Hermes Agent is MIT licensed.
