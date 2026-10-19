# Human2AI Labs — official website

A lightweight, responsive research website designed for GitHub Pages.

**Public URL after deployment:** https://human2ai.github.io

## Pages

- `index.html` — mission, research themes, featured paper
- `research.html` — papers, publication status, abstracts, links
- `projects.html` — research initiatives and benchmarks
- `people.html` — four team members; replace initials with portraits when ready
- `contact.html` — collaboration directions and GitHub contact
- `assets/styles.css` — entire white-and-orange visual design
- `assets/site.js` — mobile menu and optional contact email
- `assets/favicon.svg` — lab favicon

## Publish using GitHub's website UI

1. Open https://github.com/human2ai/human2ai.github.io
2. Click **Add file → Upload files**. Upload the contents of this extracted folder, preserving `assets/` and the files in the repository root. Avoid nesting the entire folder under another folder.
3. Commit the changes to `main`.
4. Under **Settings → Pages**, choose **Deploy from a branch**, `main`, `/(root)`, then **Save**.
5. Open https://human2ai.github.io. It may take a few minutes for the first deployment.

If using Git locally instead, copy these files into the existing cloned repository and `git add . && git commit -m "Launch Human2AI Labs website" && git push`.

## Edit before or after publishing

- **Member photos:** In `people.html`, replace each `<div class="person-initials">...` with an `<img>` element and add a portrait image under `assets/`. Confirm member permission before publishing photos.
- **Member bios / affiliations:** Edit the individual cards in `people.html`. University/school names are *paper affiliations*, not claims that someone is a graduate or employee of the school.
- **Research:** `research.html` includes the three H2A Labs studies and a clearly separated prior paper by Aman Syed. See the manuscript-status note below.
- **Public email:** Fill in `email: ''` inside `assets/site.js`. The page will automatically reveal a `mailto:` link.
- **Research code and datasets:** Add public GitHub repository links to project cards when available.
- **Style:** Main color variables are at the top of `assets/styles.css`.

## Publication accuracy notes

- Causal graph paper: **accepted at five NeurIPS 2026 workshops** (LIGHT oral, LP4FM spotlight, TAE/PTA/NewInML posters); do not call this a main-conference acceptance.
- Affective dynamics paper: **ICLR 2027 main conference submission**, not accepted. The user-provided OpenReview record indicates a submission and public PDF.
- Agentic paper: the user provided a public **NeurIPS 2026 AgenticLS workshop submission** containing "Biological Hypothesis Formation" in its original title. The site uses the broader research direction title requested by the user and links the earlier biological workshop submission explicitly. The non-biological extension is **in progress**; neither version is described as accepted.
- Prior MedVCTP research: distinct from H2A Labs; presented separately as a member's prior work.
- **No establishment date** is displayed on the site.

## Testing locally

Open `index.html` in any browser, or run from this folder:

```sh
python -m http.server 8000
```

Then browse to http://localhost:8000.

The website uses HTML/CSS/vanilla JavaScript and has **no Node.js dependency or build step**.
