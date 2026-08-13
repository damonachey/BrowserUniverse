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

## The `Thing` primitive

Every object in the universe is a `Thing`:

```js
{
  id: 1,
  properties: { name: 'Nebula-482', created: Date, modified: Date },
  relationships: [],
  events: [],
  behaviors: [],
  permissions: {},
}
```

- `id` — assigned on creation, immutable.
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
  (not auto-incrementing). Currently holds one key, `nextThingId`, which
  `createThing()` reads, uses, and increments in the same transaction as the
  `things` write so id assignment can't race or collide.

`db.js` exports the only functions allowed to touch IndexedDB directly:
`createThing`, `getThing`, `getAllThings`, `updateThing`, `deleteThing`, `resetAll`.
Pages should go through these rather than opening the database themselves.

## Routing

There's no router and no build step, so navigation between pages is done with plain
links and a query string: `thing.html?id=5`. `thing.html` reads `id` from
`location.search`, loads that Thing from IndexedDB, and renders it. This works on
any static host with no server-side or fallback-page tricks required — the
tradeoff is a `?id=5` URL instead of a path like `/Thing/5`.
