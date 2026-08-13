export class Thing {
  constructor(id, name) {
    this.id = id;
    this.properties = { name, created: new Date(), modified: new Date() };
    this.relationships = [];
    this.events = [];
    this.behaviors = [];
    this.permissions = {};
  }
}
