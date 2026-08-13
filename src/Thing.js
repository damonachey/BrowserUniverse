export class Thing {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.properties = {};
    this.relationships = [];
    this.events = [];
    this.behaviors = [];
    this.permissions = {};
  }
}
