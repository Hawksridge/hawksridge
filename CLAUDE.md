# claudesite

Static photography portfolio for mattmihaly.com, deployed via GitHub Pages
(`CNAME` + `.nojekyll`, served straight from `main`). No build step, no backend.

## Gallery update workflow (paste-and-go)

The home gallery is a hardcoded list inside the `<div class="gallery-grid">` block
in `index.html`. The user manages it visually in `admin.html` (open in a browser →
add/edit/reorder photos → **Export HTML** → paste the output into the chat).

**When the user pastes admin-exported gallery HTML, do all of this without asking:**

1. **Make sure the source images exist.** New photos must already be in `images/`
   (the user copies them there). If a referenced `images/<file>.jpg` is missing, stop
   and tell the user which file to add.

2. **Generate image sizes.** Run `./generate-thumbs.sh`. For any new/updated original it
   creates TWO sizes (idempotent — safe to re-run):
   - `images/thumbs/<file>.jpg` — 900px, used by the grid (mobile) and as the `src`/small
     `srcset` candidate.
   - `images/large/<file>.jpg` — 1600px, used by the stacked single-column layout shown on
     laptop/desktop (`@media (min-width: 768px)` in `styles.css`).
   Both directories must end up committed.

3. **Add `width`/`height` AND `srcset` to every `<img>`.** As of commit `a2c8fdf` the admin
   export emits most of the live-site format — thumb path in `src`, full-size in `data-full`,
   and the `hidden` class on color items. It can't add image dimensions or the responsive
   `srcset` (the browser tool doesn't have the thumb's pixel size, and thumbs/large are
   generated afterward by `generate-thumbs.sh`). So each `<img>` must end up as:
   ```html
   <img src="images/thumbs/<file>.jpg" data-full="images/<file>.jpg" alt="<title>" loading="lazy" srcset="images/thumbs/<file>.jpg 900w, images/large/<file>.jpg 1600w" sizes="(min-width: 768px) min(1000px, 100vw), 100vw" width="<W>" height="<H>">
   ```
   - `width`/`height` are the **900px thumb's** pixel dimensions. Get them with
     `sips -g pixelWidth -g pixelHeight images/thumbs/<file>.jpg`. These prevent layout
     shift and must be present on every entry.
   - `srcset` lets laptop/desktop load the sharp 1600px `large/` image while mobile keeps
     the 900px thumb. `data-full` (full-size original) still feeds the lightbox — leave it.
   - Preserve the order and the `landscape`/`portrait`/`square` class the user chose.
   - Sanity-check the export already did its part: every `data-type="bw"` item should
     have the `hidden` class (color shows by default — the flicker fix in `f4824b9`), and
     every `<img>` should have `data-full`. If an older export is missing these, add them.

4. **Replace the gallery.** Swap the entire contents of the `<div class="gallery-grid">`
   block in `index.html` with the normalized entries (keep the `<!-- COLOR PHOTOS -->`
   / `<!-- B&W PHOTOS -->` comments).

5. **Diff against the live gallery before committing.** The admin export is the full
   new list — entries the user removed, renamed, or reordered are intentional. After
   editing, briefly tell the user which photos were added / removed / renamed so they
   can confirm.

6. **Commit and push.** Commit the new originals in `images/`, their `images/thumbs/` and
   `images/large/` versions, and `index.html` together — then `git push origin main`
   without asking. The live site is the user's only preview, so always push.

## Deploy / push

Remote is SSH (`git@github.com:Hawksridge/hawksridge.git`). An ed25519 key on the user's
Mac authenticates non-interactively, so `git push origin main` just works — no PAT or
keychain dance. GitHub Pages rebuilds within ~1 min of a push to `main`. Only if SSH
itself breaks should you fall back to credential troubleshooting.

Shape commands to match the permission allowlist: run `git add` / `git commit` / `git push`
as separate calls (not `&&`-chained), and use `git commit -m "title" -m "body"` rather than
a `$(cat <<EOF …)` heredoc — command substitution and chaining defeat the allowlist and
trigger needless prompts.
