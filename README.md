# Human2AI Labs — official research website

The public website for Human2AI Labs, hosted at https://human2ai.github.io.

## Pages

- `index.html`: mission, accepted research, lab identity.
- `research.html`: research catalog; papers 02/03 require an unlock key to see details.
- `projects.html`: research projects and interactive experiments.
- `people.html`: team profiles.
- `contact.html`: collaboration and contact information.
- `dag-sandbox.html`: interactive causal DAG editor (graph structure, paths, confounders, mediators, colliders, direct adjacency matrix).
- `affect-sandbox.html`: **illustrative** emotional-dynamics toy simulator; not the fitted method or experimental results from a study.

The site uses only HTML/CSS/vanilla JS and GitHub Pages; no build process is required.

## Research access

Research titles, author lists, summaries, and PDF links for papers 02 and 03 are kept out of the regular HTML and stored in a PBKDF2/AES-GCM encrypted payload in `assets/papers-lock.js`. Visitors enter the lab's chosen key to decrypt in the browser; no key is published in the repository. An unlock stays in memory only until leaving the page or reloading.

**Important:** This is a convenience barrier for casual visitors, **not secure authentication or guaranteed confidentiality**. GitHub Pages is public static hosting, low-entropy passwords can be guessed, and a paper that was publicly posted on OpenReview remains accessible through its original public record. To truly restrict access, host unpublished material behind server-side authentication instead.

To change the key or paper details, re-encrypt an updated JSON payload with 160,000 PBKDF2-HMAC-SHA256 iterations, a random 16-byte salt, a random 12-byte AES-GCM IV, and AES-256-GCM, then update the `salt`, `iv`, and `body` values in `assets/papers-lock.js`.

## Publication wording

- Causal reasoning: accepted at **five NeurIPS 2026 workshops**, with LIGHT oral and LP4FM spotlight.
- Paper 02: submitted to ICLR 2027 main conference; **not accepted**.
- Paper 03: an earlier version was submitted to the NeurIPS 2026 AgenticLS workshop; a non-biological extension is in progress. **No acceptance claimed**.
- MedVCTP: prior research by a member; not a Human2AI Labs project.

## Modifying the sandboxes

- `assets/dag-sandbox.js`: edit presets, automatic role inference, edge creation, live matrix.
- `assets/affect-sandbox.js`: toy response update and charts.
- `assets/styles.css`: white/orange design system, responsive components and both playgrounds.

The DAG editor's confounder/mediator/collider markers are structural annotations for teaching and should not be treated as automated causal-identification proofs. The emotional model is intentionally synthetic.

## Publishing

GitHub Pages serves the `main` branch root. Assets must remain in the `assets/` directory. `.nojekyll` is intentional.

No lab establishment date is included.

## Portrait studio (People page)

The bottom of `people.html` includes a key-gated portrait editing interface.

- Choose Aman, Maheen, Benjamin or Raghav.
- Select a JPG, PNG or WebP (up to 12 MB), or drag it into the preview area.
- Change the portrait frame between rounded square and circle.
- Adjust zoom (100–300%), shift the crop on either axis, or drag the photo directly in the preview.
- Preview the result on that member's card. Save the source image and crop settings to the current browser's IndexedDB to keep previews after refresh.
- Export a 960 × 960 transparent PNG matching the chosen clipped frame.

**Deployment limitation:** This is a local photo-preview and export editor. The editor's shared simple key is **not actual GitHub write authorization**. GitHub Pages is static; permanently publishing portrait files for *all* visitors requires making a GitHub commit with properly authorized credentials, e.g. uploading the exported image through the connected GitHub account/assistant. Do not put GitHub tokens or organization credentials in public source code. Members' photos should only be published with permission.

Implementation: `assets/portrait-studio.js`, additions to `assets/styles.css`, and portrait placeholders in `people.html`. Published portraits are stored in `assets/portraits/` and displayed globally. Local photo drafts are specific to the editor's browser and do not replace the public images unless separately committed to GitHub.
