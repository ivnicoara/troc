// Mock data for the Troc demo. Everything is in-memory; App mirrors
// the mutable slices (likes/matches/messages/karma) to localStorage.

// --- Photos -----------------------------------------------------------
// Real product photos are pulled by keyword from LoremFlickr (works on
// any device with a network). If one ever fails to load, the <Photo>
// component swaps in the hand-tinted SVG fallback below so a card never
// looks broken.
const PALETTES = [
  ['#e8c9a0', '#c8643f'],
  ['#bcd0b6', '#3f6b4f'],
  ['#f0d68a', '#caa12f'],
  ['#e7bcb0', '#b5654a'],
  ['#d9c2e0', '#7d5a8c'],
  ['#cfe0e6', '#41707e'],
]

function photo(glyph, seed = 0) {
  const [a, b] = PALETTES[seed % PALETTES.length]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='760'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${a}'/>
        <stop offset='1' stop-color='${b}'/>
      </linearGradient>
    </defs>
    <rect width='600' height='760' fill='url(#g)'/>
    <text x='300' y='420' font-size='240' text-anchor='middle'
      font-family='Apple Color Emoji, Segoe UI Emoji, sans-serif'>${glyph}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function avatar(glyph, a, b) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
    </linearGradient></defs>
    <rect width='200' height='200' rx='100' fill='url(#g)'/>
    <text x='100' y='138' font-size='96' text-anchor='middle'
      font-family='Apple Color Emoji, Segoe UI Emoji, sans-serif'>${glyph}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const flickr = (kw, lock) =>
  `https://loremflickr.com/640/800/${encodeURIComponent(kw)}?lock=${lock}`

// Build an item's photo set: real keyword photos + matching SVG fallbacks.
// Expanded to 3 shots so the detail "profile" view has a gallery.
function shots(kw, glyph, locks) {
  const all = [...locks, locks[0] + 503, locks[0] + 907].slice(0, 3)
  return {
    photos: all.map((l) => flickr(kw, l)),
    fallback: all.map((_, i) => photo(glyph, i + kw.length)),
  }
}

export function makePhoto(glyph, seed = 0) {
  return photo(glyph, seed)
}

// keyword used to fetch a real photo for user-listed items, by category
export const CATEGORY_KEYWORD = {
  electronics: 'gadget',
  books: 'books',
  clothing: 'clothing',
  furniture: 'furniture',
  kitchen: 'kitchenware',
  sports: 'sports,equipment',
  kids: 'toys',
  other: 'objects',
}

export function listingPhotos(category, glyph) {
  const kw = CATEGORY_KEYWORD[category] || 'objects'
  const lock = Math.floor(Math.random() * 90) + 10
  return {
    photos: [flickr(kw, lock)],
    fallback: [photo(glyph, kw.length)],
  }
}

export const ITEM_EMOJIS = [
  '📷','🎸','📚','🛠️','🍲','🧶','🪴','☕','📖','🪖','🧥','🚲','🔋','⛺','🪑',
  '♟️','🔊','🎞️','🎵','🪔','🧺','🍳','🥾','🎨','🧸','⏰','🪞','🎧','📺','🛼',
]

export const CATEGORIES = [
  'electronics',
  'books',
  'clothing',
  'furniture',
  'kitchen',
  'sports',
  'kids',
  'other',
]

export const CONDITIONS = ['new', 'like new', 'good', 'fair']

export const MEETUP_SPOTS = [
  'Café in front of the métro (public, busy)',
  'The local library entrance',
  'Saturday market square',
  'Park bandstand by the main path',
  'Bakery corner on the high street',
]

export const USERS = [
  {
    id: 'u_camille',
    firstName: 'Camille',
    fullName: 'Camille R.',
    avatar: avatar('🧶', '#e8c9a0', '#c8643f'),
    city: 'Paris',
    neighborhood: 'Montmartre',
    lat: 48.8867,
    lng: 2.3431,
    bio: 'Knitter, plant hoarder, always mid-renovation. Trading my way to a tidier flat.',
  },
  {
    id: 'u_bruno',
    firstName: 'Bruno',
    fullName: 'Bruno M.',
    avatar: avatar('🎸', '#bcd0b6', '#3f6b4f'),
    city: 'Paris',
    neighborhood: 'Le Marais',
    lat: 48.859,
    lng: 2.358,
    bio: 'Vinyl, vintage hi-fi, and old cameras. One in, one out — that is the rule.',
  },
  {
    id: 'u_salome',
    firstName: 'Salomé',
    fullName: 'Salomé D.',
    avatar: avatar('📚', '#f0d68a', '#caa12f'),
    city: 'Paris',
    neighborhood: 'Canal Saint-Martin',
    lat: 48.8709,
    lng: 2.3674,
    bio: 'Reader, baker, weekend cyclist. Books in, banana bread out.',
  },
  {
    id: 'u_thierry',
    firstName: 'Thierry',
    fullName: 'Thierry V.',
    avatar: avatar('🛠️', '#cfe0e6', '#41707e'),
    city: 'Paris',
    neighborhood: 'Belleville',
    lat: 48.8721,
    lng: 2.3829,
    bio: 'Tinkerer and dad of two. The garage is full; help me empty it.',
  },
]

export const ITEMS = [
  {
    id: 'i1',
    ownerId: 'u_bruno',
    title: 'Vintage film camera',
    category: 'electronics',
    condition: 'good',
    description:
      'A lovely 35mm rangefinder from the 70s. Light meter still works, leather case included. Shoots beautifully.',
    wants: 'A decent French press or a record crate',
    ...shots('vintage,camera', '📷', [11, 12]),
  },
  {
    id: 'i2',
    ownerId: 'u_bruno',
    title: 'Crate of jazz vinyl',
    category: 'other',
    condition: 'good',
    description: 'About 25 records — bebop, cool jazz, a little soul. Sleeves are worn but the wax is clean.',
    wants: 'Open to offers',
    ...shots('vinyl,records', '🎵', [21, 22]),
  },
  {
    id: 'i3',
    ownerId: 'u_bruno',
    title: 'Bookshelf speakers (pair)',
    category: 'electronics',
    condition: 'like new',
    description: 'Warm, punchy little speakers. Barely used since I moved to headphones. Cables included.',
    wants: 'A turntable or amp',
    ...shots('speaker,audio', '🔊', [31, 32]),
  },
  {
    id: 'i4',
    ownerId: 'u_camille',
    title: 'Cast-iron Dutch oven',
    category: 'kitchen',
    condition: 'good',
    description: 'Enamelled, 5L, the colour of a tomato. Seasoned with years of soup. A little chip on the lid.',
    wants: 'A good chef knife or a cutting board',
    ...shots('cookware,pot', '🍲', [41, 42]),
  },
  {
    id: 'i5',
    ownerId: 'u_camille',
    title: 'Box of wool & needles',
    category: 'other',
    condition: 'good',
    description: 'A retired knitter clearing out: merino, alpaca, bamboo needles in many sizes. So much yarn.',
    wants: 'Open to offers',
    ...shots('wool,yarn', '🧶', [51, 52]),
  },
  {
    id: 'i6',
    ownerId: 'u_camille',
    title: 'Rattan plant stand',
    category: 'furniture',
    condition: 'fair',
    description: 'Three tiers of 70s rattan. One leg has been re-glued but it is solid. Plants not included (sadly).',
    wants: 'A grow light or ceramic pots',
    ...shots('plant,stand', '🪴', [61, 62]),
  },
  {
    id: 'i7',
    ownerId: 'u_camille',
    title: 'French press, never used',
    category: 'kitchen',
    condition: 'new',
    description: 'Gift I never opened — 1L glass press, copper frame. Still boxed.',
    wants: 'Camera gear or a nice notebook',
    ...shots('frenchpress,coffee', '☕', [71, 72]),
  },
  {
    id: 'i8',
    ownerId: 'u_salome',
    title: 'Stack of novels (literary fiction)',
    category: 'books',
    condition: 'good',
    description: 'A dozen contemporary novels, all read once, no broken spines. Happy to split the stack.',
    wants: 'More books, or baking tins',
    ...shots('books,novel', '📚', [81, 82]),
  },
  {
    id: 'i9',
    ownerId: 'u_salome',
    title: 'Cookbook collection',
    category: 'books',
    condition: 'like new',
    description: 'Six baking & bread books. I have memorised them; time to pass them on.',
    wants: 'A loaf tin or a kitchen scale',
    ...shots('cookbook', '📖', [91, 92]),
  },
  {
    id: 'i10',
    ownerId: 'u_salome',
    title: 'Commuter bike helmet',
    category: 'sports',
    condition: 'like new',
    description: 'Size M, matte sage green, worn one season. Clean pads, no impacts.',
    wants: 'Bike lights or a pannier',
    ...shots('bicycle,helmet', '🪖', [101, 102]),
  },
  {
    id: 'i11',
    ownerId: 'u_salome',
    title: 'Wool winter coat',
    category: 'clothing',
    condition: 'good',
    description: 'Camel-coloured, size 38, beautifully heavy. Loved but it no longer fits me.',
    wants: 'Open to offers',
    ...shots('wool,coat', '🧥', [111, 112]),
  },
  {
    id: 'i12',
    ownerId: 'u_thierry',
    title: 'Kids balance bike',
    category: 'kids',
    condition: 'good',
    description: 'Wooden balance bike, both my kids learned on it. Scuffed but sturdy and adorable.',
    wants: 'A scooter or board games',
    ...shots('kids,bicycle', '🚲', [121, 122]),
  },
  {
    id: 'i13',
    ownerId: 'u_thierry',
    title: 'Cordless drill + bits',
    category: 'electronics',
    condition: 'good',
    description: '18V drill, two batteries, a tin of mixed bits. Garage is overflowing with tools.',
    wants: 'A hand plane or clamps',
    ...shots('drill,tools', '🔋', [131, 132]),
  },
  {
    id: 'i14',
    ownerId: 'u_thierry',
    title: 'Camping tent (2-person)',
    category: 'sports',
    condition: 'fair',
    description: 'Done a lot of festivals. One pole is taped but it stands fine. Free to a good adventure.',
    wants: 'Open to offers',
    ...shots('tent,camping', '⛺', [141, 142]),
  },
  {
    id: 'i15',
    ownerId: 'u_thierry',
    title: 'Mid-century side table',
    category: 'furniture',
    condition: 'good',
    description: 'Teak, tapered legs, one ring stain that gives it character. Heavier than it looks.',
    wants: 'A reading lamp or a rug',
    ...shots('table,furniture', '🪑', [151, 152]),
  },
  {
    id: 'i16',
    ownerId: 'u_bruno',
    title: 'Chess set, hand-carved',
    category: 'other',
    condition: 'like new',
    description: 'Olive wood pieces, folding board. Won it, never play. Deserves someone who does.',
    wants: 'Books or vinyl',
    ...shots('chess,set', '♟️', [161, 162]),
  },
]

export const WISHLIST = [
  {
    id: 'w1',
    userId: 'u_camille',
    title: 'A small espresso machine',
    note: 'Manual or electric, anything that survives a Monday. Will trade yarn, pots, or the rattan stand.',
  },
  {
    id: 'w2',
    userId: 'u_bruno',
    title: 'A working turntable',
    note: 'Belt-drive preferred. Have speakers, vinyl, and a camera to put on the table.',
  },
  {
    id: 'w3',
    userId: 'u_salome',
    title: 'A sturdy bread loaf tin',
    note: 'Pullman / lidded tin ideally. Trading novels, cookbooks, or actual bread.',
  },
  {
    id: 'w4',
    userId: 'u_thierry',
    title: 'Board games for ages 5–9',
    note: 'The kids have outgrown screen-free evenings being optional. Tools or bikes in return.',
  },
  {
    id: 'w5',
    userId: 'u_salome',
    title: 'A second-hand road bike, size S',
    note: 'Nothing fancy, just roadworthy. Happy to throw in books and the camel coat.',
  },
]

// Pre-seeded so the demo opens with social proof and at least one
// near-match the user can complete on the very first swipe.
export const SEED_LIKES = [
  { userId: 'u_bruno', itemId: 'i7', dir: 'right' },
  { userId: 'u_bruno', itemId: 'i4', dir: 'super' },
  { userId: 'u_salome', itemId: 'i4', dir: 'right' },
  { userId: 'u_thierry', itemId: 'i16', dir: 'right' },
  { userId: 'u_camille', itemId: 'i1', dir: 'right' },
]

export const SEED_KARMA = {
  u_camille: 3,
  u_bruno: 5,
  u_salome: 2,
  u_thierry: 4,
}

export function distanceKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function karmaBadge(points) {
  if (points >= 12) return { label: 'Legendary Trader', glyph: '🏆' }
  if (points >= 8) return { label: 'Seasoned Swapper', glyph: '🥇' }
  if (points >= 4) return { label: 'Trusted Trader', glyph: '🤝' }
  if (points >= 1) return { label: 'First Swap', glyph: '🌱' }
  return { label: 'New Trader', glyph: '✨' }
}
