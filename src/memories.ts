/**
 * ─────────────────────────────────────────────────────────────
 *  ALL THE WORDS ON THE SITE LIVE HERE.
 *  Change the text between the quotes and save — that's it.
 *
 *  Photos and videos go in the folder  public/memories/
 *  using the names written next to each item below
 *  (for example story-01.jpg or reel-2.mp4).
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

  // ── Our story: the timeline (files story-01 … story-20) ──
  // date: any text you like, e.g. '29 May 2026'
  timeline: [
    { date: '[Date 01]', title: '[Title 01]', caption: '[Placeholder] What happened on this day.', media: 'story-01' },
    { date: '[Date 02]', title: '[Title 02]', caption: '[Placeholder] What happened on this day.', media: 'story-02' },
    { date: '[Date 03]', title: '[Title 03]', caption: '[Placeholder] What happened on this day.', media: 'story-03' },
    { date: '[Date 04]', title: '[Title 04]', caption: '[Placeholder] What happened on this day.', media: 'story-04' },
    { date: '[Date 05]', title: '[Title 05]', caption: '[Placeholder] What happened on this day.', media: 'story-05' },
    { date: '[Date 06]', title: '[Title 06]', caption: '[Placeholder] What happened on this day.', media: 'story-06' },
    { date: '[Date 07]', title: '[Title 07]', caption: '[Placeholder] What happened on this day.', media: 'story-07' },
    { date: '[Date 08]', title: '[Title 08]', caption: '[Placeholder] What happened on this day.', media: 'story-08' },
    { date: '[Date 09]', title: '[Title 09]', caption: '[Placeholder] What happened on this day.', media: 'story-09' },
    { date: '[Date 10]', title: '[Title 10]', caption: '[Placeholder] What happened on this day.', media: 'story-10' },
    { date: '[Date 11]', title: '[Title 11]', caption: '[Placeholder] What happened on this day.', media: 'story-11' },
    { date: '[Date 12]', title: '[Title 12]', caption: '[Placeholder] What happened on this day.', media: 'story-12' },
    { date: '[Date 13]', title: '[Title 13]', caption: '[Placeholder] What happened on this day.', media: 'story-13' },
    { date: '[Date 14]', title: '[Title 14]', caption: '[Placeholder] What happened on this day.', media: 'story-14' },
    { date: '[Date 15]', title: '[Title 15]', caption: '[Placeholder] What happened on this day.', media: 'story-15' },
    { date: '[Date 16]', title: '[Title 16]', caption: '[Placeholder] What happened on this day.', media: 'story-16' },
    { date: '[Date 17]', title: '[Title 17]', caption: '[Placeholder] What happened on this day.', media: 'story-17' },
    { date: '[Date 18]', title: '[Title 18]', caption: '[Placeholder] What happened on this day.', media: 'story-18' },
    { date: '[Date 19]', title: '[Title 19]', caption: '[Placeholder] What happened on this day.', media: 'story-19' },
    { date: '[Date 20]', title: '[Title 20]', caption: '[Placeholder] What happened on this day.', media: 'story-20' },
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
