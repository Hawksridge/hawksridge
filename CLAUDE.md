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

2. **Generate thumbnails.** Run `./generate-thumbs.sh`. It creates 600px-wide thumbs
   in `images/thumbs/` for any new/updated originals (idempotent — safe to re-run).

3. **Add `width`/`height` to every `<img>`.** As of commit `6e80bb9` the admin export
   already emits the live-site format — thumb path in `src`, full-size in `data-full`,
   and the `hidden` class on color items. The ONE thing it can't add is image
   dimensions (the browser tool doesn't have the thumbnail's pixel size, since thumbs
   are generated afterward by `generate-thumbs.sh`). So each `<img>` must end up as:
   ```html
   <img src="images/thumbs/<file>.jpg" data-full="images/<file>.jpg" alt="<title>" loading="lazy" width="<W>" height="<H>">
   ```
   - Get dimensions with `sips -g pixelWidth -g pixelHeight images/thumbs/<file>.jpg`.
     These prevent layout shift and must be present on every entry.
   - Preserve the order and the `landscape`/`portrait`/`square` class the user chose.
   - Sanity-check the export already did its part: every `data-type="color"` item should
     have the `hidden` class (B&W shows by default — the flicker fix in `f4824b9`), and
     every `<img>` should have `data-full`. If an older export is missing these, add them.

4. **Replace the gallery.** Swap the entire contents of the `<div class="gallery-grid">`
   block in `index.html` with the normalized entries (keep the `<!-- COLOR PHOTOS -->`
   / `<!-- B&W PHOTOS -->` comments).

5. **Diff against the live gallery before committing.** The admin export is the full
   new list — entries the user removed, renamed, or reordered are intentional. After
   editing, briefly tell the user which photos were added / removed / renamed so they
   can confirm.

6. **Commit** the new image files, their thumbs, and `index.html` together. Then push
   if auth is working (see below).

## Deploy / push

Remote is HTTPS (`github.com/hawksridge/hawksridge`). GitHub Pages rebuilds within
~1 min of a push to `main`. Pushing requires valid credentials in the macOS keychain
(a fine-grained PAT with **Contents: Read and write**, or an SSH key). If a push/fetch
fails with "Invalid username or token," the saved credential is bad and the user must
re-authenticate once in their own terminal before pushes can succeed.
