/**
 * ─────────────────────────────────────────────────────────────
 *  ALL THE WORDS ON THE SITE LIVE HERE.
 *  Change the text between the quotes and save — that's it.
 *
 *  Photos and videos go in the folder  public/memories/
 *  using the names written next to each item below
 *  (for example memory-01.jpg or reel-2.mp4).
 *  Allowed types: .jpg  .png  .webp  .mp4
 *  If a file is missing, a soft placeholder tile is shown instead.
 * ─────────────────────────────────────────────────────────────
 */

export const memories = {
  // ── The two of you ────────────────────────────────────────
  names: {
    first: 'Ade',
    second: 'Omolade',
  },

  // The day it all began. The counter counts from midnight of
  // this day, Lagos time. Format: 'YYYY-MM-DD'.
  startDate: '2026-05-29',

  // ── Top of the page ───────────────────────────────────────
  hero: {
    label: 'Our memories',
    // One short line under your names.
    line: '[Placeholder] A little place to keep every moment of us.',
  },

  // ── The 3D cube: one caption per face (files cube-1 … cube-6) ──
  cube: [
    { media: 'cube-1', caption: '[Placeholder] Cube caption one' },
    { media: 'cube-2', caption: '[Placeholder] Cube caption two' },
    { media: 'cube-3', caption: '[Placeholder] Cube caption three' },
    { media: 'cube-4', caption: '[Placeholder] Cube caption four' },
    { media: 'cube-5', caption: '[Placeholder] Cube caption five' },
    { media: 'cube-6', caption: '[Placeholder] Cube caption six' },
  ],

  // ── Our memories: the frames you scroll past (files memory-01 … memory-20) ──
  // Each frame is one photo or short video. Their order is shuffled on
  // every visit. To add more frames, add more names here (memory-21 …).
  memoryFrames: [
    'memory-01',
    'memory-02',
    'memory-03',
    'memory-04',
    'memory-05',
    'memory-06',
    'memory-07',
    'memory-08',
    'memory-09',
    'memory-10',
    'memory-11',
    'memory-12',
    'memory-13',
    'memory-14',
    'memory-15',
    'memory-16',
    'memory-17',
    'memory-18',
    'memory-19',
    'memory-20',
  ],

  // ── Moving pictures: short clips (files reel-1 … reel-4) ──
  // Optional poster pictures: reel-1-poster.jpg etc. (shown until the clip loads).
  reels: ['reel-1', 'reel-2', 'reel-3', 'reel-4'],

  // ── The little things ─────────────────────────────────────
  // One short line per card. Add or remove lines freely.
  loveLines: {
    // Ade writing about Omolade (shown in blue)
    adeOnOmolade: [
      '[Placeholder] The way you laugh at your own jokes first.',
      '[Placeholder] How you remember every small thing I say.',
      '[Placeholder] Your voice notes that start with a sigh.',
      '[Placeholder] How calm everything feels when you are near.',
    ],
    // Omolade writing about Ade (shown in rose)
    omoladeOnAde: [
      '[Placeholder] How you always walk on the outside of the road.',
      '[Placeholder] The face you make when you are thinking.',
      '[Placeholder] That you never let me end a day sad.',
      '[Placeholder] How you say my full name, slowly.',
    ],
  },

  // ── The two letters ───────────────────────────────────────
  // The greeting ("Omolade," / "Ade,") and the sign-off ("Yours, Ade" /
  // "Yours, Omolade") are added automatically. Each paragraph is its own item.
  letters: {
    fromAde: {
      paragraphs: [
        '[Placeholder] Ade’s letter to Omolade. Write the first paragraph here.',
        '[Placeholder] Then a second paragraph, as long or as short as you like.',
      ],
    },
    fromOmolade: {
      paragraphs: [
        '[Placeholder] Omolade’s letter to Ade. Write the first paragraph here.',
        '[Placeholder] Then a second paragraph, as long or as short as you like.',
      ],
    },
  },

  // ── The very end (file: closing) ──────────────────────────
  closing: {
    media: 'closing',
    line: '[Placeholder] And this is only the beginning.',
  },
}

export type Memories = typeof memories
