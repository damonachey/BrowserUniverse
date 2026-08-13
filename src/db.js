import { Thing } from './Thing.js';
import { uuidv7 } from './uuid.js';

const DB_NAME = 'BrowserUniverse';
const DB_VERSION = 2;
const STORE_THINGS = 'things';
const STORE_GLOBALS = 'globals';

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
  const tx = db.transaction(STORE_THINGS, 'readwrite');
  const thing = new Thing(uuidv7(), name ?? 'New Thing');
  tx.objectStore(STORE_THINGS).put(thing);
  await txToPromise(tx);
  return thing;
}

export async function getThing(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readonly');
  return requestToPromise(tx.objectStore(STORE_THINGS).get(id));
}

export async function getAllThings() {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readonly');
  const things = await requestToPromise(tx.objectStore(STORE_THINGS).getAll());
  return things.sort((a, b) => a.id.localeCompare(b.id));
}

export async function updateThing(thing) {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readwrite');
  const store = tx.objectStore(STORE_THINGS);
  const existing = await requestToPromise(store.get(thing.id));

  const timestamp = new Date();
  for (const property of Object.keys(thing.properties)) {
    if (!existing || existing.properties[property] !== thing.properties[property]) {
      thing.events.push({ timestamp, action: 'property changed', property, value: thing.properties[property] });
    }
  }

  store.put(thing);
  await txToPromise(tx);
  return thing;
}

export async function deleteThing(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readwrite');
  tx.objectStore(STORE_THINGS).delete(id);
  await txToPromise(tx);
}

export async function resetAll() {
  const db = await openDB();
  const tx = db.transaction(STORE_THINGS, 'readwrite');
  tx.objectStore(STORE_THINGS).clear();
  await txToPromise(tx);
}
