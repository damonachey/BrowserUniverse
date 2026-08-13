# Architecture

BrowserUniverse is a static site with no build step and no backend — everything runs
client-side in plain JavaScript (ES modules), and all data lives in the browser's
IndexedDB. It's hosted as a GitHub Pages project site at https://achey.net/BrowserUniverse/.

## Files

- `index.html` — lists all Things in a table; create/reset controls.
- `thing.html` — detail/edit view for a single Thing, selected via `?id=`.
- `src/Thing.js` — the `Thing` data model.
- `src/db.js` — all IndexedDB access.
- `src/randomName.js` — generates a random name for newly created Things.
- `src/uuid.js` — generates UUIDv7 ids for new Things.

## The `Thing` primitive

Every object in the universe is a `Thing`:

```js
{
  id: '0189c1e2-3f8a-7e1b-9c2d-1a2b3c4d5e6f',
  properties: { name: 'Nebula-482', created: Date, modified: Date },
  relationships: [],
  events: [],
  behaviors: [],
  permissions: {},
}
```

- `id` — a UUIDv7 (`src/uuid.js`), assigned on creation, immutable. UUIDv7 embeds a
  millisecond timestamp in its leading bits, so ids sort lexicographically in
  creation order — that's why `getAllThings()` can order by `id` directly instead
  of needing a separate counter or `created` sort. Ids are not shown in the
  `index.html` table (Name links to the detail page instead) but are displayed,
  read-only, on `thing.html`.
- `properties` — a free-form key/value bag. `name` lives here rather than as a
  top-level field so it's editable and extensible the same way as any other
  property. `created` and `modified` are timestamps managed by `db.js`, not the UI —
  `created` is set once at creation, `modified` is stamped on every `updateThing()` call.
- `relationships`, `events`, `behaviors` — lists, shape not yet defined; currently
  always empty.
- `permissions` — a key/value bag, shape not yet defined; currently always empty.

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
