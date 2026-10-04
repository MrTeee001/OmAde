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
    // An optional short line under your names. Leave it as '' to show nothing.
    line: '',
  },



  // ── The little things ─────────────────────────────────────
  // One short line per card. Add or remove lines freely.
  loveLines: {
    // Ade writing about Omolade (shown in blue)
    adeOnOmolade: [
      'I love your laughter, oh my God, I love making you laugh',
      'I love how you are intentional about me',
      'I love when you call me just because you want to sleep',
      'I love how you do like my big sis, ehn small madam',
    ],
    // Omolade writing about Ade (shown in rose)
    omoladeOnAde: [
      'The way you hold my hands',
      'The way you make me feel loved and comfortable 🥰',
      'I love that you can cook because who doesn’t want a fine man that can also feed her? 🤭',
      'The way you check up on me and your compliments too',
    ],
  },

  // ── The two letters ───────────────────────────────────────
  // The greeting ("Omolade," / "Ade,") and the sign-off ("Yours, Ade" /
  // "Yours, Omolade") are added automatically. Each paragraph is its own item.
  letters: {
    // Ade's letter to Omolade
    fromAde: {
      paragraphs: [
        'Loving you feels like having a little piece of home in a person, and I hope you never forget how deeply precious you are to me.',
        'I want to love you, softly, loudly, on the easy days, on the hard ones, and in all the little moments in between and if there’s one thing I’m sure of, it’s that I want to keep choosing you, growing with you, annoying you 😝 and loving you properly through every version of us.',
        '❤️',
      ],
    },
    // Omolade's letter to Ade
    fromOmolade: {
      paragraphs: [
        'There are so many little things about you that I love. I love how you make me laugh (even if I don’t admit it 😝), how you care about me, how you can be so annoying and still make me want you around 😂❤️, and of course the fact that you can actually cook (even remain groom price 😂). But beyond all of that, I just love the way being with you feels. You’ve become such a special part of my life (I wasn’t even expecting it 😂), and I’m genuinely grateful for every moment we share.',
        'I love you, Ade. I love who you are, and I love the person you’re becoming 😌. I want to keep growing with you, laughing with you, annoying you and making beautiful memories together. You’re my baby boy, Mr Babe, and I hope you never forget how much you mean to me. ❤️',
      ],
    },
  },

  // ── The very end: an optional line under the closing picture.
  // Leave it as '' to show nothing.
  closing: {
    line: '',
  },
}

export type Memories = typeof memories
