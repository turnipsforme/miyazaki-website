# Article Windows

This document is the source of truth for the site's article/document windows.
It is written for whoever — developer, editor, or LLM — adds future articles.

## Purpose

The chronology is a map of Hayao Miyazaki's life. **Article windows** are small
discoveries sitting inside that map: primary documents, interviews, essays, and
clippings that belong to a specific year of the chronology but are not films.
They appear as small editorial teasers inside the timeline and open into a
restrained floating reading window over the page.

Article windows are deliberately secondary. They must never replace film
windows, alter year labels, or grow into a second navigation system.

## Visual rule

Small editorial document teasers that fit the existing site:

- thin border, square corners, white surface, very restrained shadow
- existing serif for headlines, existing sans-serif for metadata
- no gradients, glass effects, rounded SaaS cards, or oversized buttons
- hover is only an affordance; opening happens on click/tap only

The reading window is a native `<dialog>` (`#article-dialog`) containing one
reusable lazy `<iframe>`. The backdrop is translucent so the landing page stays
recognizable underneath. Escape, the close button, and clicking outside all
close it; focus returns to the teaser that opened it.

## Content location

All articles live in:

```text
_articles/*.md
```

Each article is Markdown with YAML front matter. Jekyll converts them to static
HTML pages during the GitHub Pages build (permalink: `/articles/:name/`).
There is **no browser-side Markdown parser and no Node build step** — the
browser only ever receives plain static HTML.

## Front matter schema

```yaml
---
title: "Article title"
date: YYYY-MM-DD
timeline_year: "YYYY"
original_author: "Original author"
source_author: "Archive/source contributor, if supplied"
source_url: "URL of the source document, if one exists in the material"
source_publication: "Publication/issue line extracted from the source"  # optional
source_book: "Book the text was collected in, if any"                   # optional
excerpt: "One short source-derived sentence for the timeline teaser."
---
```

### `date` vs `timeline_year`

These are separate fields on purpose:

- `date` records the actual date of the document/article.
- `timeline_year` controls where its window appears in Miyazaki's chronology.

Example: an article published in 2020 discussing a 1984 event would use
`date: 2020-05-10` and `timeline_year: "1984"`.

Conventions used by the current articles (keep them consistent):

- month-only dates use the first day of the month
- season issues (e.g. "Summer issue") use the first month of the season
- year-only dates use January 1st of that year
- if the supplied material contains no date at all, omit `date` entirely —
  do not guess

## How to add an article

1. Create a Markdown file in `_articles/`.
2. Copy the front matter template above.
3. Fill in metadata from the source. Do not invent anything missing.
4. Write/paste the article body. Only normalize structure (headings, spacing);
   never rewrite the prose.
5. Set `timeline_year`.
6. Add `{% raw %}{% include article-windows.html year="YYYY" %}{% endraw %}`
   after the appropriate chronology row in `index.html` — but only if that year
   does not already have an article-window include. Multiple articles in one
   year are sorted automatically by `date`; no extra HTML is needed.
7. Commit. GitHub Pages builds the static article automatically.

For a completely new chronology year with no obvious event row, place the
include in the nearest appropriate chapter and record the decision here rather
than silently dropping the article.

Current placements: includes exist for years 1979–1998, 2000, 2001, 2002,
2006, 2007, 2009, 2014, and 2021 inside their respective `#life-*` chapters.

## Window behavior

- click/tap opens the floating reading window
- hover/focus only highlights the teaser
- clicking outside the window closes it
- the close button closes it
- Escape closes it
- focus returns to the triggering teaser on close
- the article scrolls inside its own iframe; the landing page cannot scroll
- the landing page remains visible behind the translucent backdrop
- without JavaScript, each teaser is simply a normal link to the standalone
  article page

## Performance rule

Full article bodies must never be embedded into `index.html`. The pipeline is:

```text
Markdown source → Jekyll build → static article HTML →
small timeline teaser → click → one reusable <dialog> →
one lazy iframe loads the selected article
```

No Markdown parser, UI library, modal library, animation library, or new web
font may be added. Article images are stored locally under
`images/articles/`, referenced via `relative_url`, and lazy-loaded.

## Content integrity rule

Do not invent source metadata, quotes, dates, photographs, captions, or
biographical facts. If a value isn't in the supplied material, leave the field
out. Preserve the distinction between original authorship and archive
contributors (e.g. `Author: [[Tom]]` in a clipping's own metadata is the
*contributor*, not the author). Never fact-check-and-silently-rewrite the
source text; only make structural improvements required for good HTML.

## Style rule

No modern SaaS modal design: no glassmorphism, pill-shaped UI, giant close
buttons, animated gradients, blur, spring animations, or huge shadows. A thin
border, a tiny title bar, a small close button, and readable text are enough.

## Accessibility rule

Every teaser is a real `<a>` with a meaningful accessible name and a visible
`:focus-visible` state equivalent to hover. The dialog has an accessible label,
an explicit close button, Escape-to-close, and focus return. Every article page
has a real `<h1>`; section headings from Markdown become `<h2>`. All modal
interactions work with keyboard and touch. `prefers-reduced-motion` removes
teaser movement and non-essential transitions while preserving the dialog,
scrolling, and navigation.

## Reference implementation

`_articles/howls-moving-castle-directors-vision-statement.md` is the first
implementation example:

- title: *Howl's Moving Castle Director's Vision Statement*
- date: `2002-10-28` (the date signed at the end of the statement)
- timeline_year: `"2002"` — its teaser appears immediately after the existing
  2002 "Golden Bear" event and before the 2003 event
- original_author: `Hayao Miyazaki` ("By Hayao Miyazaki" in the source)
- source_author: `Tom` (`Author: [[Tom]]` in the source metadata)
- source_url: extracted from the source's URL line
- body: verbatim from the supplied document, with `**Section**` lines promoted
  to proper headings and duplicate title/source/date metadata represented in
  front matter instead
