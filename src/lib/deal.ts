import { memories } from '../memories'
import { allMedia, isVideo } from './media'

/** A fresh random order (Fisher–Yates shuffle). */
function shuffle<T>(list: readonly T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Takes (and removes) up to `count` items matching `test` from the pile. */
function take(pile: string[], count: number, test: (file: string) => boolean = () => true) {
  const picked: string[] = []
  for (let i = 0; i < pile.length && picked.length < count; ) {
    if (test(pile[i])) picked.push(...pile.splice(i, 1))
    else i++
  }
  return picked
}

// Words shown on empty spots until real photos and videos are added.
const PHOTO = 'photo'
const VIDEO = 'video'

/*
 * Every visit (and every reload) shuffles the whole pile of photos and videos
 * and deals it out at random. Nothing is saved, so each visit is different:
 *   - the reel ("Moving pictures") gets up to 4 videos,
 *   - the closing spot gets a photo,
 *   - the cube gets 6 of whatever is left (photos or videos),
 *   - every remaining file becomes a memory frame.
 */
const pile = shuffle(allMedia)
const empty = pile.length === 0

const reel = take(pile, 4, isVideo)
const closing = take(pile, 1, (f) => !isVideo(f))[0] ?? take(pile, 1)[0] ?? PHOTO
const cube = take(pile, 6)
const frames = pile

export const reelClips: string[] = empty ? Array(4).fill(VIDEO) : reel
export const closingMedia: string = closing
/** The six cube faces; captions belong to the card spots, not to particular photos. */
export const cubeFaces = memories.cubeCaptions.slice(0, 6).map((caption, i) => ({
  media: cube[i] ?? PHOTO,
  caption,
}))
export const memoryFrames: string[] = empty ? Array(20).fill(PHOTO) : frames
