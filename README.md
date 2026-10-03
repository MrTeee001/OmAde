# Ade & Omolade — our memories

A one-page memories website.

## Changing the words
Open `src/memories.ts` and edit the text between the quotes.

## Adding photos and videos
Drop files into `public/memories/` using these names (any of `.jpg`, `.png`, `.webp`, `.mp4`):

- `cube-1` … `cube-6`
- `memory-01` … `memory-20`
- `reel-1` … `reel-4`
- `closing`

Missing files show a soft placeholder tile, so the site always works.
The cube photos, memory frames and reel clips are shuffled into a new order on every visit.

## Running it on a computer
Needs [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dev      # live preview at http://localhost:5173
npm run build    # finished site in the dist/ folder, ready to upload
```
