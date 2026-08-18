# Architecture

BrowserUniverse is a static site with no build step and no backend — everything runs
client-side in plain JavaScript (ES modules), and all data lives in the browser's
IndexedDB. It's hosted as a GitHub Pages project site at https://achey.net/BrowserUniverse/.

## Files

- `index.html` — lists all Things in a table; create/reset controls.
- `thing.html` — detail/edit view for a single Thing, selected via `?id=`.
- `stats.html` — Thing count and browser storage usage (`navigator.storage.estimate()`).
- `src/Thing.js` — the `Thing` data model.
- `src/db.js` — all IndexedDB access.
- `src/randomName.js` — generates a random name for newly created Things.
- `src/uuid.js` — generates UUIDv7 ids for new Things.

## The `Thing` primitive

Every object in the universe is a `Thing`:

```js
{
  id: '0189c1e2-3f8a-7e1b-9c2d-1a2b3c4d5e6f',
  properties: { name: 'Nebula-482' },
  relationships: [],
  events: [
    { timestamp: Date, action: 'created' },
    { timestamp: Date, action: 'property changed', property: 'name', value: 'Nebula-482' },
  ],
  behaviors: [],
}
```

- `id` — a UUIDv7 (`src/uuid.js`), assigned on creation, immutable. UUIDv7 embeds a
  millisecond timestamp in its leading bits, so ids sort lexicographically in
  creation order — that's why `getAllThings()` can order by `id` directly instead
  of needing a separate counter or `created` sort. Ids are not shown in the
  `index.html` table (Name links to the detail page instead) but are displayed,
  read-only, on `thing.html`.
- `properties` — a free-form key/value bag holding a Thing's current state.
  `name` lives here rather than as a top-level field so it's editable and
  extensible the same way as any other property.
- `events` — an append-only log of things that happened to this Thing, each with
  a `timestamp` and an `action`. Every Thing gets a `created` event followed by a
  `property set` event for each initial property (currently just `name`).
  `updateThing()` diffs the incoming `properties` against what's stored and
  appends a `property set` event per changed field — this is also how "last
  modified" is derived, rather than a separate `modified` field: it's just the
  timestamp of the most recent event.
- `relationships` — a list of links to other Things, each
  `{ relationshipId, relationship, to }`: `relationshipId` is a UUIDv7 assigned
  when the link is created, `relationship` names the link (e.g. `'Orbits'`),
  and `to` is the id of the target Thing. Added via `addRelationship(thing,
  relationship, to)` (`src/Thing.js`) — a standalone function rather than a
  class method, since Things loaded from IndexedDB are plain objects and don't
  carry the `Thing` prototype. `thing.html` offers `'Orbits'` as the only
  relationship type so far, chosen from a list of all other Things.
- `behaviors` — a list, shape not yet defined; currently always empty.

## IndexedDB schema

Database: `BrowserUniverse` (version 2), defined in `src/db.js`.

- **`things`** — object store keyed by `id`. Holds one record per `Thing`.
- **`globals`** — object store for miscellaneous global values, keyed explicitly
  (not auto-incrementing). Not currently used for anything, but kept around for
  future global/singleton values.

`db.js` exports the only functions allowed to touch IndexedDB directly:
`createThing`, `getThing`, `getAllThings`, `updateThing`, `deleteThing`, `resetAll`.
Pages should go through these rather than opening the database themselves.

## Routing

There's no router and no build step, so navigation between pages is done with plain
links and a query string: `thing.html?id=<uuid>`. `thing.html` reads `id` from
`location.search`, loads that Thing from IndexedDB, and renders it. This works on
any static host with no server-side or fallback-page tricks required — the
tradeoff is a `?id=` URL instead of a path like `/Thing/<uuid>`.
