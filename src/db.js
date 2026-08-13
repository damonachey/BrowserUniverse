import { Thing } from './Thing.js';

const DB_NAME = 'BrowserUniverse';
const DB_VERSION = 2;
const STORE_THINGS = 'things';
const STORE_GLOBALS = 'globals';
const NEXT_THING_ID_KEY = 'nextThingId';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_THINGS)) {
        db.createObjectStore(STORE_THINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_GLOBALS)) {
        db.createObjectStore(STORE_GLOBALS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txToPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function createThing(name) {
  const db = await openDB();
  const tx = db.transaction([STORE_GLOBALS, STORE_THINGS], 'readwrite');
  const globals = tx.objectStore(STORE_GLOBALS);
  const things = tx.objectStore(STORE_THINGS);

  const current = await requestToPromise(globals.get(NEXT_THING_ID_KEY));
  const id = current ?? 1;
  globals.put(id + 1, NEXT_THING_ID_KEY);

  const thing = new Thing(id, name ?? `Thing ${id}`);
  things.put(thing);

  await txToPromise(tx);
  return thing;
}

export async function getAllThings() {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readonly');
  const things = await requestToPromise(tx.objectStore(STORE_THINGS).getAll());
  return things.sort((a, b) => a.id - b.id);
}

export async function deleteThing(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readwrite');
  tx.objectStore(STORE_THINGS).delete(id);
  await txToPromise(tx);
}

export async function resetAll() {
  const db = await openDB();
  const tx = db.transaction([STORE_GLOBALS, STORE_THINGS], 'readwrite');
  tx.objectStore(STORE_THINGS).clear();
  tx.objectStore(STORE_GLOBALS).put(1, NEXT_THING_ID_KEY);
  await txToPromise(tx);
}
