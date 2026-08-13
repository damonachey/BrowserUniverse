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
    this.permissions = {};
  }
}
