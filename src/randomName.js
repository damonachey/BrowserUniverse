const WORDS = [
  'Nebula', 'Comet', 'Quasar', 'Photon', 'Nova', 'Pulsar',
  'Meteor', 'Orbit', 'Galaxy', 'Cosmos', 'Star', 'Aurora',
  'Eclipse', 'Vortex', 'Asteroid',
];

export function randomName() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${word}-${number}`;
}
