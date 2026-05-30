import { customAlphabet } from 'nanoid';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generate = customAlphabet(CHARSET, 4);

export function generateKey(): string {
  return `ALONE-${generate()}-${generate()}-${generate()}-${generate()}`;
}

export function generateKeys(count: number): string[] {
  const keys: string[] = [];
  const max = Math.min(Math.max(count, 1), 100);
  for (let i = 0; i < max; i++) {
    keys.push(generateKey());
  }
  return keys;
}

export function generateApiKey(): string {
  const gen = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);
  return `aa_${gen()}`;
}
