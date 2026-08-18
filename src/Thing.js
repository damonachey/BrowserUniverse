import { uuidv7 } from './uuid.js';

export class Thing {
  constructor(id, name) {
    this.id = id;
    this.properties = { name };
    this.relationships = [];
    this.events = [
      { timestamp: new Date(), action: 'created' },
      { timestamp: new Date(), action: 'property changed', property: 'name', value: name },
    ];
    this.behaviors = [];
  }
}

// Things loaded from IndexedDB are plain objects (structured clone drops the
// `Thing` prototype), so this works on any thing-shaped object rather than
// being a class method.
export function addRelationship(thing, relationship, to) {
  thing.relationships.push({ relationshipId: uuidv7(), relationship, to });
}
