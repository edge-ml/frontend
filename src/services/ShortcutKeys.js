// Ordered list of physical keyboard keys used to assign shortcuts to a dynamic
// list of labels. The top number row covers the first 10 labels; once that row
// is exhausted, the next rows of the keyboard are used (qwertyuiop, asdfghjkl,
// zxcvbnm) so labels 11+ map to "the next row of keys" instead of non-existent
// two-digit keystrokes like "10".
export const SHORTCUT_KEYS = "1234567890qwertyuiopasdfghjklzxcvbnm";

// Returns the shortcut key character for a given label index, or null if the
// index is out of range.
export function indexToShortcutKey(index) {
  if (index < 0 || index >= SHORTCUT_KEYS.length) return null;
  return SHORTCUT_KEYS[index];
}

// Returns the label index for a pressed key (case-insensitive), or -1 when the
// key is not part of the shortcut scheme.
export function keyToShortcutIndex(key) {
  if (typeof key !== "string" || key.length !== 1) return -1;
  return SHORTCUT_KEYS.indexOf(key.toLowerCase());
}
