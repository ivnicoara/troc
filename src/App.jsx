import { useEffect, useMemo, useRef, useState } from 'react'
import {
  USERS,
  ITEMS,
  WISHLIST,
  CATEGORIES,
  CONDITIONS,
  MEETUP_SPOTS,
  ITEM_EMOJIS,
  SEED_LIKES,
  SEED_KARMA,
  distanceKm,
  karmaBadge,
  makePhoto,
} from './data.js'

const STORE_KEY = 'troc_state_v1'
const SUPER_PER_DAY = 3
const today = () => new Date().toISOString().slice(0, 10)
const uid = () => Math.random().toString(36).slice(2, 9)
const matchKey = (a, b) => [a, b].sort().join('__')

const DEFAULT_STATE = {
  currentUserId: 'u_camille',
  likes: SEED_LIKES.map((l) => ({ ...l, ts: 0 })),
  addedItems: [],
  messages: {},
  karma: { ...SEED_KARMA },
  completed: [],
  blocked: {},
  profiles: {},
  superUsage: {},
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATE
  }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('feed')
  const [matchModal, setMatchModal] = useState(null)
  const [openChat, setOpenChat] = useState(null)
  const [toast, setToast] = useState(null)
  const knownMatches = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / disabled — demo still works in memory */
    }
  }, [state])

  const flash = (msg) => {
    setToast(msg)
    window.clearTimeout(flash._t)
    flash._t = window.setTimeout(() => setToast(null), 2200)
  }

  const me = useMemo(() => {
    const base = USERS.find((u) => u.id === state.currentUserId)
    return { ...base, ...(state.profiles[base.id] || {}) }
  }, [state.currentUserId, state.profiles])

  const allItems = useMemo(
    () => [...ITEMS, ...state.addedItems],
    [state.addedItems],
  )

  const userById = (id) => {
    const base = USERS.find((u) => u.id === id)
    return { ...base, ...(state.profiles[id] || {}) }
  }
  const itemById = (id) => allItems.find((i) => i.id === id)

  const myBlocked = state.blocked[state.currentUserId] || []
  const isBlocked = (otherId) =>
    myBlocked.includes(otherId) ||
    (state.blocked[otherId] || []).includes(state.currentUserId)

  // ---- Matches derived from the like graph -------------------------
  const matches = useMemo(() => {
    const liked = (uId, ownerId) =>
      state.likes.filter(
        (l) =>
          l.userId === uId &&
          (l.dir === 'right' || l.dir === 'super') &&
          (itemById(l.itemId)?.ownerId === ownerId),
      )
    const out = []
    for (let i = 0; i < USERS.length; i++) {
      for (let j = i + 1; j < USERS.length; j++) {
        const a = USERS[i].id
        const b = USERS[j].id
        const aWantsFromB = liked(a, b)
        const bWantsFromA = liked(b, a)
        if (aWantsFromB.length && bWantsFromA.length) {
          out.push({
            id: matchKey(a, b),
            a,
            b,
            itemFromB: aWantsFromB[0].itemId,
            itemFromA: bWantsFromA[0].itemId,
          })
        }
      }
    }
    return out
  }, [state.likes, state.addedItems])

  // Pop the celebratory screen only for matches created after load.
  useEffect(() => {
    if (knownMatches.current === null) {
      knownMatches.current = new Set(matches.map((m) => m.id))
      return
    }
    const fresh = matches.find(
      (m) =>
        !knownMatches.current.has(m.id) &&
        (m.a === state.currentUserId || m.b === state.currentUserId),
    )
    knownMatches.current = new Set(matches.map((m) => m.id))
    if (fresh) setMatchModal(fresh)
  }, [matches, state.currentUserId])

  const myMatches = matches.filter(
    (m) =>
      (m.a === state.currentUserId || m.b === state.currentUserId) &&
      !isBlocked(m.a === state.currentUserId ? m.b : m.a),
  )

  // ---- Swipe feed --------------------------------------------------
  const [radius, setRadius] = useState(8)
  const swipedIds = new Set(
    state.likes.filter((l) => l.userId === state.currentUserId).map((l) => l.itemId),
  )
  const feed = useMemo(() => {
    return allItems
      .filter((it) => it.ownerId !== state.currentUserId)
      .filter((it) => !swipedIds.has(it.id))
      .filter((it) => !isBlocked(it.ownerId))
      .map((it) => ({
        ...it,
        dist: distanceKm(me, userById(it.ownerId)),
      }))
      .filter((it) => it.dist <= radius)
      .sort((x, y) => x.dist - y.dist)
  }, [allItems, state.likes, state.currentUserId, radius, state.blocked, me])

  const superUse = state.superUsage[state.currentUserId]
  const supersLeft =
    superUse && superUse.day === today()
      ? Math.max(0, SUPER_PER_DAY - superUse.used)
      : SUPER_PER_DAY

  const swipe = (item, dir) => {
    if (dir === 'super' && supersLeft <= 0) {
      flash('No super-swaps left today — back tomorrow!')
      return
    }
    setState((s) => {
      const next = {
        ...s,
        likes: [
          ...s.likes,
          { userId: s.currentUserId, itemId: item.id, dir, ts: Date.now() },
        ],
      }
      if (dir === 'super') {
        const u = s.superUsage[s.currentUserId]
        const used = u && u.day === today() ? u.used + 1 : 1
        next.superUsage = {
          ...s.superUsage,
          [s.currentUserId]: { day: today(), used },
        }
      }
      return next
    })
  }

  // ---- Listing a new item -----------------------------------------
  const addItem = (draft) => {
    const item = {
      id: 'mine_' + uid(),
      ownerId: state.currentUserId,
      ...draft,
      photos: draft.emojis.map((e, idx) => makePhoto(e, idx + draft.title.length)),
    }
    setState((s) => ({ ...s, addedItems: [item, ...s.addedItems] }))
    flash('Listed! It’s now in the swap feed.')
    setTab('mystuff')
  }

  // ---- Chat --------------------------------------------------------
  const sendMessage = (m, payload) => {
    setState((s) => {
      const thread = s.messages[m.id] || []
      return {
        ...s,
        messages: {
          ...s.messages,
          [m.id]: [
            ...thread,
            { id: uid(), from: s.currentUserId, ts: Date.now(), ...payload },
          ],
        },
      }
    })
  }

  const completeSwap = (m) => {
    if (state.completed.includes(m.id)) return
    setState((s) => ({
      ...s,
      completed: [...s.completed, m.id],
      karma: {
        ...s.karma,
        [m.a]: (s.karma[m.a] || 0) + 1,
        [m.b]: (s.karma[m.b] || 0) + 1,
      },
    }))
    flash('Swap marked complete — +1 karma to you both! 🌱')
  }

  const blockUser = (otherId) => {
    setState((s) => ({
      ...s,
      blocked: {
        ...s.blocked,
        [s.currentUserId]: [
          ...(s.blocked[s.currentUserId] || []),
          otherId,
        ],
      },
    }))
    setOpenChat(null)
    flash('User blocked. You won’t see their items or messages.')
  }

  const resetDemo = () => {
    localStorage.removeItem(STORE_KEY)
    knownMatches.current = null
    setState({ ...DEFAULT_STATE, likes: SEED_LIKES.map((l) => ({ ...l, ts: 0 })) })
    setTab('feed')
    setOpenChat(null)
    flash('Demo reset.')
  }

  const switchUser = (id) => {
    knownMatches.current = new Set(matches.map((m) => m.id))
    setState((s) => ({ ...s, currentUserId: id }))
    setOpenChat(null)
    setTab('feed')
  }

  const unreadCount = myMatches.filter((m) => (state.messages[m.id] || []).length)
    .length

  return (
    <div className="app">
      <div className="topbar">
        <div className="wordmark">
          troc<span className="dot" />
          <small>barter, not buy</small>
        </div>
        <div className="demo-switch" title="Switch demo user">
          <span>as</span>
          {USERS.map((u) => (
            <button
              key={u.id}
              className={u.id === state.currentUserId ? 'active' : ''}
              onClick={() => switchUser(u.id)}
              title={u.firstName}
            >
              <img src={u.avatar} alt={u.firstName} />
            </button>
          ))}
        </div>
      </div>

      {tab === 'feed' && (
        <FeedScreen
          feed={feed}
          me={me}
          userById={userById}
          radius={radius}
          setRadius={setRadius}
          supersLeft={supersLeft}
          onSwipe={swipe}
        />
      )}
      {tab === 'wishlist' && (
        <WishlistScreen
          userById={userById}
          isBlocked={isBlocked}
          currentUserId={state.currentUserId}
        />
      )}
      {tab === 'list' && <ListScreen onAdd={addItem} />}
      {tab === 'mystuff' && (
        <MyStuffScreen
          state={state}
          allItems={allItems}
          itemById={itemById}
          userById={userById}
          myMatches={myMatches}
          onOpenChat={(m) => setOpenChat(m)}
        />
      )}
      {tab === 'profile' && (
        <ProfileScreen
          me={me}
          karma={state.karma[state.currentUserId] || 0}
          itemCount={
            allItems.filter((i) => i.ownerId === state.currentUserId).length
          }
          matchCount={myMatches.length}
          onSave={(patch) =>
            setState((s) => ({
              ...s,
              profiles: {
                ...s.profiles,
                [s.currentUserId]: {
                  ...(s.profiles[s.currentUserId] || {}),
                  ...patch,
                },
              },
            }))
          }
          onReset={resetDemo}
        />
      )}

      <nav className="nav">
        {[
          ['feed', '🔥', 'Swap'],
          ['wishlist', '🌟', 'Wishes'],
          ['list', '➕', 'List'],
          ['mystuff', '🎒', 'My stuff'],
          ['profile', '🙂', 'Profile'],
        ].map(([key, ic, label]) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            <span className="ic" style={{ position: 'relative' }}>
              {ic}
              {key === 'mystuff' && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </span>
            {label}
          </button>
        ))}
      </nav>

      {matchModal && (
        <MatchModal
          match={matchModal}
          me={me}
          userById={userById}
          itemById={itemById}
          onChat={() => {
            setOpenChat(matchModal)
            setMatchModal(null)
            setTab('mystuff')
          }}
          onClose={() => setMatchModal(null)}
        />
      )}

      {openChat && (
        <ChatScreen
          match={openChat}
          state={state}
          me={me}
          userById={userById}
          itemById={itemById}
          onBack={() => setOpenChat(null)}
          onSend={sendMessage}
          onComplete={completeSwap}
          onBlock={blockUser}
          onReport={() =>
            flash('Report sent to the Troc team. Thanks for keeping it kind.')
          }
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

/* ===================== Feed ===================== */
function FeedScreen({ feed, me, userById, radius, setRadius, supersLeft, onSwipe }) {
  return (
    <div className="screen">
      <div className="radius-bar">
        <span>📍 Within</span>
        <input
          type="range"
          min="1"
          max="10"
          value={radius}
          onChange={(e) => setRadius(+e.target.value)}
        />
        <span style={{ minWidth: 70, textAlign: 'right' }}>
          {radius} km · {me.neighborhood}
        </span>
      </div>
      <div className="deck">
        {feed.length === 0 ? (
          <div className="deck-empty">
            <div className="big">🧺</div>
            <h3 className="serif">The market’s quiet</h3>
            <p className="muted">
              No more nearby swaps right now. Widen your radius, switch demo
              user, or list something of your own.
            </p>
          </div>
        ) : (
          feed
            .slice(0, 3)
            .reverse()
            .map((item, idx, arr) => {
              const isTop = idx === arr.length - 1
              return (
                <SwipeCard
                  key={item.id}
                  item={item}
                  owner={userById(item.ownerId)}
                  depth={arr.length - 1 - idx}
                  isTop={isTop}
                  onSwipe={(dir) => onSwipe(item, dir)}
                />
              )
            })
        )}
      </div>
      <div className="deck-actions">
        <button
          className="fab nope"
          onClick={() => feed[0] && onSwipe(feed[0], 'left')}
          disabled={!feed.length}
          title="Pass"
        >
          ✕
        </button>
        <button
          className="fab super"
          onClick={() => feed[0] && onSwipe(feed[0], 'super')}
          disabled={!feed.length}
          title={`Super-swap (${supersLeft} left today)`}
        >
          ⭐
        </button>
        <button
          className="fab like"
          onClick={() => feed[0] && onSwipe(feed[0], 'right')}
          disabled={!feed.length}
          title="Interested"
        >
          ♥
        </button>
      </div>
      <p
        className="muted"
        style={{ textAlign: 'center', marginTop: 8, fontSize: '0.74rem' }}
      >
        Swipe the card → interested · ← pass · ↑ super-swap ·{' '}
        {supersLeft} super left today
      </p>
    </div>
  )
}

function SwipeCard({ item, owner, depth, isTop, onSwipe }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [leaving, setLeaving] = useState(null)
  const [photoIdx, setPhotoIdx] = useState(0)
  const start = useRef(null)

  const onDown = (e) => {
    if (!isTop || leaving) return
    start.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    if (!start.current) return
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y })
  }
  const finish = (dir) => {
    const fly =
      dir === 'right'
        ? { x: 600, y: drag.y }
        : dir === 'left'
        ? { x: -600, y: drag.y }
        : { x: drag.x, y: -800 }
    setLeaving(fly)
    setTimeout(() => onSwipe(dir), 230)
  }
  const onUp = () => {
    if (!start.current) return
    start.current = null
    const { x, y } = drag
    if (y < -130 && Math.abs(y) > Math.abs(x)) finish('super')
    else if (x > 120) finish('right')
    else if (x < -120) finish('left')
    else setDrag({ x: 0, y: 0 })
  }

  const pos = leaving || drag
  const rot = leaving ? pos.x / 14 : drag.x / 18
  const style = isTop
    ? {
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rot}deg)`,
        transition: leaving
          ? 'transform 0.23s ease-out'
          : start.current
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.2,1,0.3,1)',
      }
    : {
        transform: `translateY(${depth * 12}px) scale(${1 - depth * 0.045})`,
        transition: 'transform 0.3s ease',
        filter: 'brightness(0.97)',
      }

  const likeOp = isTop ? Math.max(0, Math.min(1, drag.x / 110)) : 0
  const nopeOp = isTop ? Math.max(0, Math.min(1, -drag.x / 110)) : 0
  const superOp =
    isTop && drag.y < 0 ? Math.max(0, Math.min(1, -drag.y / 130)) : 0

  return (
    <div
      className="card"
      style={style}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        className="photo"
        style={{ backgroundImage: `url("${item.photos[photoIdx]}")` }}
      />
      {item.photos.length > 1 && (
        <>
          <div
            className="photo-nav left"
            onClick={() =>
              setPhotoIdx((i) => (i - 1 + item.photos.length) % item.photos.length)
            }
          />
          <div
            className="photo-nav right"
            onClick={() => setPhotoIdx((i) => (i + 1) % item.photos.length)}
          />
          <div className="dots">
            {item.photos.map((_, i) => (
              <i key={i} className={i === photoIdx ? 'on' : ''} />
            ))}
          </div>
        </>
      )}
      <div className="badges">
        <span className="chip cond">{item.condition}</span>
        <span className="chip cat">{item.category}</span>
        {item.dist != null && item.dist < 2 && (
          <span className="chip near">very near</span>
        )}
      </div>
      <div className="scrim" />
      <div className="stamp like" style={{ opacity: likeOp }}>
        Want
      </div>
      <div className="stamp nope" style={{ opacity: nopeOp }}>
        Pass
      </div>
      <div className="stamp super" style={{ opacity: superOp }}>
        ★ Super
      </div>
      <div className="info">
        <div className="owner-row">
          <img src={owner.avatar} alt="" />
          {owner.firstName} ·{' '}
          {item.dist != null ? `${item.dist.toFixed(1)} km away` : owner.neighborhood}
        </div>
        <h2 className="serif">{item.title}</h2>
        <p className="desc">{item.description}</p>
        <span className="wants">
          🤝 Hoping for: <strong>{item.wants}</strong>
        </span>
      </div>
    </div>
  )
}

/* ===================== Match modal ===================== */
function MatchModal({ match, me, userById, itemById, onChat, onClose }) {
  const other = userById(match.a === me.id ? match.b : match.a)
  const myItem = itemById(match.a === me.id ? match.itemFromA : match.itemFromB)
  const theirItem = itemById(
    match.a === me.id ? match.itemFromB : match.itemFromA,
  )
  return (
    <div className="overlay" onClick={onClose}>
      <div className="match-card" onClick={(e) => e.stopPropagation()}>
        <div className="kicker">It’s a troc!</div>
        <h2 className="serif">A swap is brewing</h2>
        <p>
          You and {other.firstName} each want what the other’s offering. Sort
          out a fair trade and a safe spot to meet.
        </p>
        <div className="match-items">
          <div className="mi">
            <div
              className="ph"
              style={{ backgroundImage: `url("${theirItem.photos[0]}")` }}
            />
            <span>Their {theirItem.title}</span>
          </div>
          <div className="swap">⇄</div>
          <div className="mi">
            <div
              className="ph"
              style={{ backgroundImage: `url("${myItem.photos[0]}")` }}
            />
            <span>Your {myItem.title}</span>
          </div>
        </div>
        <button className="btn block green" onClick={onChat}>
          💬 Start chatting
        </button>
        <button
          className="link"
          style={{ marginTop: 14, display: 'block', width: '100%' }}
          onClick={onClose}
        >
          Keep swapping
        </button>
      </div>
    </div>
  )
}

/* ===================== Wishlist ===================== */
function WishlistScreen({ userById, isBlocked, currentUserId }) {
  const list = WISHLIST.filter(
    (w) => w.userId !== currentUserId && !isBlocked(w.userId),
  )
  return (
    <div className="screen">
      <h1 className="screen-title serif">Wishlist board</h1>
      <p className="screen-sub">
        Things neighbours are hunting for. Got one? Switch to that user later to
        see them swipe back.
      </p>
      {list.length === 0 ? (
        <div className="empty">
          <div className="big">🌟</div>
          Nothing on the board nearby right now.
        </div>
      ) : (
        list.map((w) => {
          const u = userById(w.userId)
          return (
            <div
              className="card-soft"
              key={w.id}
              style={{ padding: 16, marginBottom: 12 }}
            >
              <div
                style={{ display: 'flex', gap: 10, alignItems: 'center' }}
              >
                <img
                  src={u.avatar}
                  alt=""
                  style={{ width: 38, height: 38, borderRadius: '50%' }}
                />
                <div>
                  <strong>{u.firstName}</strong>
                  <div className="muted" style={{ fontSize: '0.76rem' }}>
                    {u.neighborhood}
                  </div>
                </div>
              </div>
              <h3
                className="serif"
                style={{ fontSize: '1.15rem', margin: '12px 0 4px' }}
              >
                Looking for: {w.title}
              </h3>
              <p className="muted">{w.note}</p>
            </div>
          )
        })
      )}
    </div>
  )
}

/* ===================== List an item ===================== */
function ListScreen({ onAdd }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('other')
  const [cond, setCond] = useState('good')
  const [openOffers, setOpenOffers] = useState(false)
  const [wants, setWants] = useState('')
  const [emojis, setEmojis] = useState([])

  const toggleEmoji = (e) =>
    setEmojis((cur) =>
      cur.includes(e)
        ? cur.filter((x) => x !== e)
        : cur.length < 4
        ? [...cur, e]
        : cur,
    )

  const valid = title.trim() && desc.trim() && emojis.length >= 1

  const submit = () => {
    if (!valid) return
    onAdd({
      title: title.trim(),
      description: desc.trim(),
      category: cat,
      condition: cond,
      wants: openOffers ? 'Open to offers' : wants.trim() || 'Open to offers',
      emojis,
    })
    setTitle('')
    setDesc('')
    setWants('')
    setEmojis([])
    setOpenOffers(false)
  }

  return (
    <div className="screen">
      <h1 className="screen-title serif">List something</h1>
      <p className="screen-sub">
        One person’s clutter is another’s treasure. Pick 1–4 “photos”.
      </p>

      <label className="field">
        <span>Photos ({emojis.length}/4)</span>
        <div className="emoji-grid">
          {ITEM_EMOJIS.map((e) => (
            <button
              key={e}
              className={emojis.includes(e) ? 'on' : ''}
              onClick={() => toggleEmoji(e)}
              type="button"
            >
              {e}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>Title</span>
        <input
          className="input"
          value={title}
          maxLength={48}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cast-iron pan"
        />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea
          className="input"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Condition details, story, quirks…"
        />
      </label>

      <label className="field">
        <span>Category</span>
        <div className="pickrow">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={c === cat ? 'on' : ''}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>Condition</span>
        <div className="pickrow">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              className={c === cond ? 'on' : ''}
              onClick={() => setCond(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </label>

      <label className="field">
        <span>Hoping to get</span>
        <input
          className="input"
          value={openOffers ? '' : wants}
          disabled={openOffers}
          onChange={(e) => setWants(e.target.value)}
          placeholder="e.g. a French press"
        />
        <button
          type="button"
          className="link"
          style={{ marginTop: 8 }}
          onClick={() => setOpenOffers((v) => !v)}
        >
          {openOffers ? '☑' : '☐'} Open to offers
        </button>
      </label>

      <button
        className="btn block"
        disabled={!valid}
        style={{ opacity: valid ? 1 : 0.5 }}
        onClick={submit}
      >
        Put it up for troc
      </button>
    </div>
  )
}

/* ===================== My stuff ===================== */
function MyStuffScreen({
  state,
  allItems,
  itemById,
  userById,
  myMatches,
  onOpenChat,
}) {
  const [sub, setSub] = useState('listed')
  const meId = state.currentUserId
  const listed = allItems.filter((i) => i.ownerId === meId)
  const likedIds = state.likes
    .filter((l) => l.userId === meId && l.dir !== 'left')
    .map((l) => l.itemId)
  const liked = likedIds.map(itemById).filter(Boolean)
  const chats = myMatches.filter((m) => (state.messages[m.id] || []).length > 0)

  return (
    <div className="screen">
      <h1 className="screen-title serif">My stuff</h1>
      <div className="seg">
        {[
          ['listed', `Listed (${listed.length})`],
          ['liked', `Liked (${liked.length})`],
          ['matches', `Matches (${myMatches.length})`],
          ['chats', `Chats (${chats.length})`],
        ].map(([k, label]) => (
          <button
            key={k}
            className={sub === k ? 'active' : ''}
            onClick={() => setSub(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === 'listed' &&
        (listed.length ? (
          <div className="grid">
            {listed.map((it) => (
              <div className="tile" key={it.id}>
                <div
                  className="thumb"
                  style={{ backgroundImage: `url("${it.photos[0]}")` }}
                />
                <div className="body">
                  <h4>{it.title}</h4>
                  <p>
                    {it.condition} · {it.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty glyph="📦" text="Nothing listed yet. Tap “List” to add." />
        ))}

      {sub === 'liked' &&
        (liked.length ? (
          <div className="grid">
            {liked.map((it) => (
              <div className="tile" key={it.id}>
                <div
                  className="thumb"
                  style={{ backgroundImage: `url("${it.photos[0]}")` }}
                />
                <div className="body">
                  <h4>{it.title}</h4>
                  <p>by {userById(it.ownerId).firstName}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty glyph="♥" text="Swipe right on things you’d swap for." />
        ))}

      {sub === 'matches' &&
        (myMatches.length ? (
          myMatches.map((m) => (
            <MatchRow
              key={m.id}
              m={m}
              meId={meId}
              userById={userById}
              itemById={itemById}
              onOpen={() => onOpenChat(m)}
              completed={state.completed.includes(m.id)}
            />
          ))
        ) : (
          <Empty
            glyph="🤝"
            text="No matches yet. When you both want each other’s stuff, it shows here."
          />
        ))}

      {sub === 'chats' &&
        (chats.length ? (
          chats.map((m) => {
            const other = userById(m.a === meId ? m.b : m.a)
            const thread = state.messages[m.id] || []
            const last = thread[thread.length - 1]
            return (
              <div
                className="card-soft"
                key={m.id}
                style={{ marginBottom: 10 }}
                onClick={() => onOpenChat(m)}
              >
                <div className="row">
                  <div
                    className="thumb-sm"
                    style={{
                      borderRadius: '50%',
                      backgroundImage: `url("${other.avatar}")`,
                    }}
                  />
                  <div className="grow">
                    <h4>{other.firstName}</h4>
                    <p>
                      {last
                        ? last.kind === 'meetup'
                          ? '📍 Proposed a meetup'
                          : last.text
                        : 'Say hello'}
                    </p>
                  </div>
                  <span className="link">Open</span>
                </div>
              </div>
            )
          })
        ) : (
          <Empty glyph="💬" text="Matches with messages will appear here." />
        ))}
    </div>
  )
}

function MatchRow({ m, meId, userById, itemById, onOpen, completed }) {
  const other = userById(m.a === meId ? m.b : m.a)
  const theirItem = itemById(m.a === meId ? m.itemFromB : m.itemFromA)
  const myItem = itemById(m.a === meId ? m.itemFromA : m.itemFromB)
  return (
    <div className="card-soft" style={{ marginBottom: 10 }} onClick={onOpen}>
      <div className="row">
        <div
          className="thumb-sm"
          style={{
            borderRadius: '50%',
            backgroundImage: `url("${other.avatar}")`,
          }}
        />
        <div className="grow">
          <h4>
            {other.firstName} {completed && '· ✅ swapped'}
          </h4>
          <p>
            Their {theirItem.title} ⇄ your {myItem.title}
          </p>
        </div>
        <span className="link">Chat</span>
      </div>
    </div>
  )
}

/* ===================== Chat ===================== */
function ChatScreen({
  match,
  state,
  me,
  userById,
  itemById,
  onBack,
  onSend,
  onComplete,
  onBlock,
  onReport,
}) {
  const other = userById(match.a === me.id ? match.b : match.a)
  const theirItem = itemById(
    match.a === me.id ? match.itemFromB : match.itemFromA,
  )
  const myItem = itemById(match.a === me.id ? match.itemFromA : match.itemFromB)
  const thread = state.messages[match.id] || []
  const [text, setText] = useState('')
  const [showMeetup, setShowMeetup] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const bodyRef = useRef(null)
  const completed = state.completed.includes(match.id)

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [thread.length, showMeetup])

  const send = () => {
    if (!text.trim()) return
    onSend(match, { kind: 'text', text: text.trim() })
    setText('')
  }

  return (
    <div className="full">
      <div className="chat-head">
        <button className="icon-btn" onClick={onBack}>
          ←
        </button>
        <img src={other.avatar} alt="" />
        <div className="grow">
          <h3 className="serif">{other.firstName}</h3>
          <p>
            Their {theirItem.title} ⇄ your {myItem.title}
          </p>
        </div>
        <button className="icon-btn" onClick={() => setShowMore(true)}>
          ⋯
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        <div className="safety-note">
          🛡️
          <span>
            Meet in a busy public place, keep it to first names, and never share
            your home address. Bring a friend if you can.
          </span>
        </div>
        {thread.length === 0 && (
          <p
            className="muted"
            style={{ textAlign: 'center', margin: '10px 0' }}
          >
            You matched! Break the ice and arrange a fair swap.
          </p>
        )}
        {thread.map((msg) =>
          msg.kind === 'meetup' ? (
            <div className="meetup-msg" key={msg.id}>
              <div className="t">📍 Meetup proposed</div>
              <div className="d">
                {msg.meetup.date} at {msg.meetup.time}
              </div>
              <div className="loc">{msg.meetup.location}</div>
              <div
                className="muted"
                style={{ fontSize: '0.68rem', marginTop: 6 }}
              >
                from {msg.from === me.id ? 'you' : other.firstName}
              </div>
            </div>
          ) : (
            <div
              key={msg.id}
              className={`bubble ${msg.from === me.id ? 'me' : 'them'}`}
            >
              {msg.text}
            </div>
          ),
        )}
      </div>

      {!completed && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '8px 12px 0',
            background: 'var(--paper)',
          }}
        >
          <button
            className="btn ghost sm"
            style={{ flex: 1 }}
            onClick={() => setShowMeetup(true)}
          >
            📍 Propose a meetup
          </button>
          <button
            className="btn green sm"
            style={{ flex: 1 }}
            onClick={() => onComplete(match)}
          >
            ✅ Mark swapped
          </button>
        </div>
      )}

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Message ${other.firstName}…`}
        />
        <button onClick={send}>➤</button>
      </div>

      {showMeetup && (
        <MeetupSheet
          onClose={() => setShowMeetup(false)}
          onSubmit={(meetup) => {
            onSend(match, { kind: 'meetup', meetup })
            setShowMeetup(false)
          }}
        />
      )}

      {showMore && (
        <div className="sheet" onClick={() => setShowMore(false)}>
          <div className="sheet-inner" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <h3 className="serif">Safety</h3>
            <button
              className="btn ghost block"
              style={{ marginBottom: 10 }}
              onClick={() => {
                onReport()
                setShowMore(false)
              }}
            >
              🚩 Report {other.firstName}
            </button>
            <button
              className="btn block"
              style={{ background: 'var(--terracotta-dark)' }}
              onClick={() => onBlock(other.id)}
            >
              ⛔ Block {other.firstName}
            </button>
            <p className="muted" style={{ marginTop: 14, textAlign: 'center' }}>
              Blocking hides their items and this chat. Reports go to the Troc
              team.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function MeetupSheet({ onClose, onSubmit }) {
  const [location, setLocation] = useState(MEETUP_SPOTS[0])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const valid = location && date && time
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-inner" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <h3 className="serif">Propose a meetup</h3>
        <label className="field">
          <span>Public spot</span>
          <select
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {MEETUP_SPOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Date</span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Time</span>
          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <button
          className="btn block green"
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.5 }}
          onClick={() => onSubmit({ location, date, time })}
        >
          Send proposal
        </button>
        <p className="muted" style={{ marginTop: 12, textAlign: 'center' }}>
          Troc only suggests public places — never home addresses.
        </p>
      </div>
    </div>
  )
}

/* ===================== Profile ===================== */
function ProfileScreen({
  me,
  karma,
  itemCount,
  matchCount,
  onSave,
  onReset,
}) {
  const badge = karmaBadge(karma)
  const [edit, setEdit] = useState(false)
  const [bio, setBio] = useState(me.bio)
  const [hood, setHood] = useState(me.neighborhood)

  useEffect(() => {
    setBio(me.bio)
    setHood(me.neighborhood)
  }, [me.id])

  return (
    <div className="screen">
      <div className="profile-head">
        <img src={me.avatar} alt="" />
        <h2 className="serif">{me.firstName}</h2>
        <div className="loc">
          📍 {hood}, {me.city}
        </div>
        <div className="karma-pill">
          {badge.glyph} {badge.label} · {karma} karma
        </div>
      </div>

      <div
        className="card-soft"
        style={{
          display: 'flex',
          padding: '14px 0',
          margin: '16px 0',
          textAlign: 'center',
        }}
      >
        <Stat n={itemCount} label="Listed" />
        <Stat n={matchCount} label="Matches" />
        <Stat n={karma} label="Swaps done" />
      </div>

      {edit ? (
        <>
          <label className="field">
            <span>Neighborhood</span>
            <input
              className="input"
              value={hood}
              onChange={(e) => setHood(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea
              className="input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <button
            className="btn block"
            onClick={() => {
              onSave({ bio: bio.trim(), neighborhood: hood.trim() })
              setEdit(false)
            }}
          >
            Save profile
          </button>
        </>
      ) : (
        <>
          <div className="card-soft" style={{ padding: 16, marginBottom: 16 }}>
            <span
              className="muted"
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              About
            </span>
            <p style={{ marginTop: 6, lineHeight: 1.5 }}>{me.bio}</p>
          </div>
          <button
            className="btn ghost block"
            onClick={() => setEdit(true)}
          >
            ✏️ Edit profile
          </button>
        </>
      )}

      <div className="divider" />
      <p className="muted" style={{ marginBottom: 10 }}>
        Only your first name and neighborhood are ever shown publicly. Exact
        location is never shared.
      </p>
      <button className="btn ghost block" onClick={onReset}>
        ↺ Reset demo data
      </button>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        className="serif"
        style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--terracotta)' }}
      >
        {n}
      </div>
      <div className="muted" style={{ fontSize: '0.74rem' }}>
        {label}
      </div>
    </div>
  )
}

function Empty({ glyph, text }) {
  return (
    <div className="empty">
      <div className="big">{glyph}</div>
      {text}
    </div>
  )
}
