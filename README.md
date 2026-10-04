# Ade & Omolade — our memories

A one-page memories website.

## Changing the words
Open `src/memories.ts` and edit the text between the quotes.

## Adding photos and videos
Drop any photos and videos into `public/memories/`, with any names (`.jpg`, `.png`, `.webp`, `.mp4`, …).

On every visit the site shuffles them all and deals them out at random: up to 4 videos for the reel,
6 for the 3D cube, and everything else as "Our memories" frames.
Until there are files, soft placeholder tiles are shown.

## Running it on a computer
Needs [Node.js](https://nodejs.org) 20 or newer.

```
npm install
npm run dev      # live preview at http://localhost:5173
npm run build    # finished site in the dist/ folder, ready to upload
```

The closing picture never changes: it is public/closing/ (a wide and a square crop).
