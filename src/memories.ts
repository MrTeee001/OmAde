/**
 * ─────────────────────────────────────────────────────────────
 *  ALL THE WORDS ON THE SITE LIVE HERE.
 *  Change the text between the quotes and save — that's it.
 *
 *  Photos and videos: just put them in the folder  public/memories/
 *  (any file names, .jpg .png .webp .mp4 …). On every visit the site
 *  shuffles them all and deals them out at random: the cube, the memory
 *  frames and the reel (videos). Every file gets used. The closing picture
 *  never changes (it lives in public/closing/).
 *  Until there are files, soft placeholder tiles are shown instead.
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

  // ── The 3D cube: when it opens into six cards, these lines appear
  // under them (one per card spot; the photos themselves are random).
  cubeCaptions: [
    '[Placeholder] Caption one',
    '[Placeholder] Caption two',
    '[Placeholder] Caption three',
    '[Placeholder] Caption four',
    '[Placeholder] Caption five',
    '[Placeholder] Caption six',
  ],


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

  // ── The very end: the line under the closing picture ─────
  closing: {
    line: '[Placeholder] And this is only the beginning.',
  },
}

export type Memories = typeof memories
