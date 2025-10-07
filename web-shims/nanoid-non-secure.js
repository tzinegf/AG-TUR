// Lightweight non-secure nanoid shim for web builds
// Matches the signature: nanoid(size?: number): string
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';

export function nanoid(size = 21) {
  let id = '';
  for (let i = 0; i < size; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}

export default nanoid;