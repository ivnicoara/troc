// Recognizable inline SVG illustrations per item. Fully offline (data
// URIs), so the picture always matches the listing — no random photos.

const BG = {
  cream: ['#f3e3c8', '#e7c9a0'],
  green: ['#cfe0c8', '#9cbf9e'],
  rose: ['#f0d3c4', '#e0a98f'],
  sky: ['#cfe1e6', '#a6c6cf'],
  gold: ['#f4dfa0', '#e6c25f'],
  mauve: ['#e2d2e6', '#bfa6c9'],
}

function wrap(bgKey, inner) {
  const [a, b] = BG[bgKey] || BG.cream
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='800' viewBox='0 0 640 800'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
      </linearGradient>
      <filter id='s' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='10' stdDeviation='14' flood-color='#5a3d22' flood-opacity='0.22'/>
      </filter>
    </defs>
    <rect width='640' height='800' fill='url(#bg)'/>
    <circle cx='320' cy='400' r='250' fill='#fffaf0' opacity='0.32'/>
    <g filter='url(#s)' transform='translate(320 400)'>${inner}</g>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// --- per-item drawings (centered around 0,0) -------------------------
const ART = {
  // Vintage film camera
  i1: `<rect x='-150' y='-95' width='300' height='190' rx='20' fill='#3a3a3f'/>
    <rect x='-150' y='-95' width='300' height='52' rx='20' fill='#55555c'/>
    <rect x='60' y='-122' width='70' height='34' rx='8' fill='#2c2c30'/>
    <circle cx='0' cy='10' r='78' fill='#1f1f22'/><circle cx='0' cy='10' r='58' fill='#3d4654'/>
    <circle cx='0' cy='10' r='30' fill='#7da0c4'/><circle cx='-18' cy='-8' r='10' fill='#dfeaf5'/>
    <circle cx='-104' cy='-60' r='15' fill='#caa12f'/>
    <rect x='96' y='-30' width='42' height='44' rx='6' fill='#caa12f'/>`,
  // Crate of jazz vinyl
  i2: `<rect x='-140' y='-120' width='280' height='230' rx='12' fill='#7a5132'/>
    <rect x='-140' y='-120' width='280' height='230' rx='12' fill='none' stroke='#5d3c24' stroke-width='10'/>
    <g><circle cx='-30' cy='-6' r='118' fill='#1c1c1c'/><circle cx='-30' cy='-6' r='44' fill='#c8643f'/>
    <circle cx='-30' cy='-6' r='8' fill='#1c1c1c'/></g>
    <rect x='70' y='-118' width='66' height='226' rx='6' fill='#e9dcc0'/>
    <rect x='70' y='-118' width='66' height='226' rx='6' fill='none' stroke='#b9a888' stroke-width='5'/>`,
  // Bookshelf speakers (pair)
  i3: `<rect x='-150' y='-130' width='130' height='260' rx='14' fill='#2f2a26'/>
    <rect x='20' y='-130' width='130' height='260' rx='14' fill='#2f2a26'/>
    <circle cx='-85' cy='-58' r='34' fill='#4a443d'/><circle cx='-85' cy='52' r='52' fill='#5a534a'/>
    <circle cx='-85' cy='52' r='24' fill='#caa12f'/>
    <circle cx='85' cy='-58' r='34' fill='#4a443d'/><circle cx='85' cy='52' r='52' fill='#5a534a'/>
    <circle cx='85' cy='52' r='24' fill='#caa12f'/>`,
  // Cast-iron Dutch oven
  i4: `<ellipse cx='0' cy='30' rx='160' ry='52' fill='#b5482f'/>
    <path d='M-160 30 Q-160 150 0 150 Q160 150 160 30 Z' fill='#c8643f'/>
    <ellipse cx='0' cy='-18' rx='168' ry='56' fill='#9c3f29'/>
    <ellipse cx='0' cy='-26' rx='168' ry='52' fill='#d2774f'/>
    <ellipse cx='0' cy='-26' rx='120' ry='34' fill='#a64f30'/>
    <rect x='-26' y='-58' width='52' height='26' rx='13' fill='#5d3320'/>
    <rect x='-198' y='-30' width='40' height='22' rx='11' fill='#9c3f29'/>
    <rect x='158' y='-30' width='40' height='22' rx='11' fill='#9c3f29'/>`,
  // Box of wool & needles
  i5: `<rect x='-150' y='-40' width='300' height='150' rx='14' fill='#caa777'/>
    <rect x='-150' y='-40' width='300' height='28' fill='#b8945f'/>
    <circle cx='-70' cy='-30' r='62' fill='#c8643f'/><circle cx='-70' cy='-30' r='62' fill='none' stroke='#a64f30' stroke-width='6' stroke-dasharray='10 14'/>
    <circle cx='60' cy='-36' r='56' fill='#3f6b4f'/><circle cx='60' cy='-36' r='56' fill='none' stroke='#2f513b' stroke-width='6' stroke-dasharray='10 14'/>
    <line x1='110' y1='-90' x2='170' y2='30' stroke='#8a6d3f' stroke-width='9' stroke-linecap='round'/>
    <line x1='140' y1='-96' x2='200' y2='24' stroke='#8a6d3f' stroke-width='9' stroke-linecap='round'/>`,
  // Rattan plant stand
  i6: `<rect x='-26' y='-30' width='52' height='150' fill='#a9854f'/>
    <path d='M-70 120 H70 L52 150 H-52 Z' fill='#8a6d3f'/>
    <ellipse cx='0' cy='-30' rx='86' ry='26' fill='#b9935a'/>
    <path d='M-86 -30 Q0 -56 86 -30 Q70 4 0 8 Q-70 4 -86 -30Z' fill='#caa777'/>
    <path d='M0 -34 Q-50 -120 -16 -180 Q4 -120 0 -34Z' fill='#3f6b4f'/>
    <path d='M0 -34 Q56 -118 24 -176 Q-4 -116 0 -34Z' fill='#4f7d5c'/>
    <path d='M0 -34 Q-6 -130 6 -190 Q18 -120 0 -34Z' fill='#5a8c66'/>`,
  // French press
  i7: `<rect x='-78' y='-150' width='156' height='270' rx='16' fill='#d8c9a8' opacity='0.5'/>
    <rect x='-78' y='-150' width='156' height='270' rx='16' fill='none' stroke='#9c8a5f' stroke-width='9'/>
    <rect x='-90' y='100' width='180' height='30' rx='10' fill='#caa12f'/>
    <rect x='-90' y='-168' width='180' height='26' rx='10' fill='#caa12f'/>
    <rect x='-12' y='-210' width='24' height='70' fill='#caa12f'/>
    <circle cx='0' cy='-220' r='22' fill='#a37f1f'/>
    <rect x='-66' y='30' width='132' height='86' rx='6' fill='#6f3f23'/>
    <path d='M78 -70 q70 30 0 110' fill='none' stroke='#a37f1f' stroke-width='16'/>`,
  // Stack of novels
  i8: `<rect x='-150' y='60' width='300' height='44' rx='6' fill='#c8643f'/>
    <rect x='-138' y='18' width='276' height='44' rx='6' fill='#3f6b4f'/>
    <rect x='-150' y='-24' width='300' height='44' rx='6' fill='#caa12f'/>
    <rect x='-128' y='-66' width='256' height='44' rx='6' fill='#7d5a8c'/>
    <rect x='-150' y='60' width='300' height='44' rx='6' fill='none' stroke='#fff' stroke-opacity='0.25' stroke-width='3'/>
    <rect x='-60' y='-150' width='130' height='168' rx='6' fill='#e7d8b8'/>
    <rect x='-60' y='-150' width='22' height='168' fill='#b9a888'/>`,
  // Cookbook collection
  i9: `<rect x='-140' y='-150' width='280' height='300' rx='10' fill='#b5482f'/>
    <rect x='-140' y='-150' width='30' height='300' fill='#8a3320'/>
    <rect x='-92' y='-110' width='200' height='30' rx='6' fill='#f3e3c8'/>
    <circle cx='8' cy='30' r='66' fill='#f3e3c8'/><circle cx='8' cy='30' r='40' fill='#caa12f'/>
    <path d='M-30 -8 h76 M8 -46 v76' stroke='#b5482f' stroke-width='10'/>`,
  // Commuter bike helmet
  i10: `<path d='M-160 40 Q-160 -150 0 -150 Q160 -150 160 40 Q160 60 140 60 L-140 60 Q-160 60 -160 40Z' fill='#3f6b4f'/>
    <path d='M-160 40 Q-160 -150 0 -150 Q60 -150 60 -150 Q-60 -120 -80 60 L-140 60 Q-160 60 -160 40Z' fill='#4f7d5c'/>
    <rect x='-150' y='34' width='300' height='30' rx='14' fill='#2f513b'/>
    <ellipse cx='-44' cy='-70' rx='22' ry='40' fill='#2f513b'/>
    <ellipse cx='44' cy='-70' rx='22' ry='40' fill='#2f513b'/>
    <ellipse cx='110' cy='-10' rx='16' ry='34' fill='#2f513b'/>`,
  // Wool winter coat
  i11: `<path d='M-30 -150 H30 L120 -110 L150 60 L96 80 L96 150 H-96 V80 L-150 60 L-120 -110Z' fill='#c79a5b'/>
    <path d='M-30 -150 L0 30 L30 -150 L70 -132 L20 150 H-20 L-70 -132Z' fill='#b6873f'/>
    <path d='M-30 -150 L0 -96 L30 -150 L8 -150 L0 -120 L-8 -150Z' fill='#9c7233'/>
    <circle cx='0' cy='-40' r='7' fill='#6f4f1f'/><circle cx='0' cy='4' r='7' fill='#6f4f1f'/>
    <circle cx='0' cy='48' r='7' fill='#6f4f1f'/>`,
  // Kids balance bike
  i12: `<circle cx='-110' cy='70' r='66' fill='#3a2f28'/><circle cx='-110' cy='70' r='30' fill='#caa12f'/>
    <circle cx='118' cy='70' r='66' fill='#3a2f28'/><circle cx='118' cy='70' r='30' fill='#caa12f'/>
    <path d='M-110 70 L20 70 L70 -30 L-40 -30 Z' fill='none' stroke='#c8643f' stroke-width='22' stroke-linejoin='round'/>
    <path d='M118 70 L70 -30' stroke='#c8643f' stroke-width='22' stroke-linecap='round'/>
    <rect x='-70' y='-58' width='90' height='20' rx='10' fill='#3f6b4f'/>
    <rect x='52' y='-66' width='44' height='18' rx='9' fill='#3f6b4f'/>`,
  // Cordless drill + bits
  i13: `<path d='M-130 -50 H70 Q120 -50 120 0 Q120 50 70 50 H-60 L-90 110 H-150 L-130 40Z' fill='#caa12f'/>
    <rect x='-150' y='80' width='80' height='44' rx='8' fill='#2f2a26'/>
    <rect x='90' y='-22' width='80' height='44' rx='10' fill='#3a3a3f'/>
    <rect x='150' y='-12' width='70' height='24' rx='6' fill='#9aa0a6'/>
    <path d='M-120 -46 H40 V40 H-96Z' fill='#e6c25f' opacity='0.5'/>`,
  // Camping tent
  i14: `<path d='M0 -140 L170 130 H-170 Z' fill='#3f6b4f'/>
    <path d='M0 -140 L60 130 H-60 Z' fill='#2f513b'/>
    <path d='M0 -140 L8 130 H-8 Z' fill='#244030'/>
    <path d='M-60 130 L0 10 L60 130Z' fill='#1d3326'/>
    <line x1='0' y1='-140' x2='0' y2='-180' stroke='#6f4f1f' stroke-width='8'/>
    <path d='M-200 130 H200' stroke='#5d3c24' stroke-width='10'/>`,
  // Mid-century side table
  i15: `<ellipse cx='0' cy='-70' rx='160' ry='44' fill='#a9743f'/>
    <ellipse cx='0' cy='-78' rx='160' ry='40' fill='#c79a5b'/>
    <rect x='-150' y='-78' width='14' height='200' rx='6' fill='#8a5a30' transform='rotate(8)'/>
    <rect x='140' y='-78' width='14' height='200' rx='6' fill='#8a5a30' transform='rotate(-8)'/>
    <rect x='-8' y='-70' width='14' height='210' rx='6' fill='#9c6736'/>
    <ellipse cx='0' cy='-78' rx='100' ry='22' fill='#b6873f' opacity='0.6'/>`,
  // Chess set
  i16: `<rect x='-160' y='110' width='320' height='40' rx='6' fill='#6f4f1f'/>
    <g fill='#f3e3c8'><circle cx='-70' cy='-70' r='30'/><rect x='-86' y='-46' width='32' height='90'/><path d='M-100 44 H-40 V70 H-100Z'/></g>
    <g fill='#3a2f28'><rect x='30' y='-70' width='52' height='30'/><rect x='38' y='-46' width='36' height='90'/><path d='M22 44 H90 V70 H22Z'/><rect x='30' y='-86' width='52' height='14'/></g>
    <g fill='#a9743f'><circle cx='110' cy='-30' r='22'/><rect x='98' y='-12' width='24' height='56'/><path d='M88 44 H132 V64 H88Z'/></g>`,
}

// Category fallback drawings for user-listed items.
const CAT_ART = {
  electronics: `<rect x='-140' y='-90' width='280' height='180' rx='16' fill='#2f2a26'/><rect x='-122' y='-72' width='244' height='144' rx='8' fill='#7da0c4'/><rect x='-40' y='90' width='80' height='30' fill='#3a3a3f'/>`,
  books: ART.i8,
  clothing: ART.i11,
  furniture: ART.i15,
  kitchen: ART.i4,
  sports: `<circle cx='0' cy='0' r='120' fill='#f3e3c8'/><path d='M0 -120 A120 120 0 0 1 104 60 M0 -120 A120 120 0 0 0 -104 60 M-104 60 A120 120 0 0 0 104 60' fill='none' stroke='#3f6b4f' stroke-width='14'/><circle cx='0' cy='0' r='34' fill='#c8643f'/>`,
  kids: ART.i12,
  other: `<rect x='-120' y='-120' width='240' height='240' rx='18' fill='#caa777'/><path d='M-120 -40 H120 M0 -120 V120' stroke='#a64f30' stroke-width='12'/><circle cx='0' cy='0' r='30' fill='#c8643f'/>`,
}

const VARIANT_BG = ['cream', 'green', 'gold', 'rose', 'sky', 'mauve']

// Three "angles" = same subject on different warm washes.
export function itemArt(id, count = 3) {
  const inner = ART[id] || CAT_ART.other
  return Array.from({ length: count }, (_, i) =>
    wrap(VARIANT_BG[(idHash(id) + i) % VARIANT_BG.length], inner),
  )
}

export function categoryArt(category, count = 3) {
  const inner = CAT_ART[category] || CAT_ART.other
  return Array.from({ length: count }, (_, i) =>
    wrap(VARIANT_BG[(idHash(category) + i) % VARIANT_BG.length], inner),
  )
}

function idHash(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
