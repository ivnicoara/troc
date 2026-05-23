# troc

> Like Tinder, but for **swapping** the things you no longer need. From the
> French _troc_ — barter, not buy.

A warm, flea-market-flavoured swap app. Browse neighbours' items, swipe to show
interest, and when two people each want what the other's offering it's a
**troc** — chat and arrange a safe, in-person swap.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

No backend — everything runs in-memory with ~16 sample items and 4 demo users,
mirrored to `localStorage` so a demo survives a refresh.

## Demo the full flow

- **Switch user** with the avatar toggle in the top-right to play both sides.
- The demo opens with **Camille already matched with Bruno** — open
  _My stuff → Matches_ to chat and **Propose a meetup**.
- For a live match: as **Camille**, swipe right on one of **Salomé's** items
  (she already likes Camille's cast-iron pan) → the match screen pops.
- _Reset demo data_ lives at the bottom of the **Profile** tab.

## What's in it

- Onboarding-style editable **profile** (first name + neighbourhood shown
  publicly only; exact location never shared)
- **List an item** — 1–4 photos, category, condition, "hoping to get"
- Full-screen **swipe deck** — right = interested, left = pass, up =
  super-swap (3/day), with drag gestures, tilt, stamps and fly-off animation
- **Mutual-match** detection + celebratory match screen
- 1:1 **chat** with a structured **Propose a meetup** message (public spots
  only)
- **My stuff** — listed / liked / matches / chats
- **Safety** — report & block, public-meetup suggestions, first-names-only
- Extras: **hyperlocal** distance radius, a **wishlist board**, and a
  **karma / reputation** system with badges for completed swaps
