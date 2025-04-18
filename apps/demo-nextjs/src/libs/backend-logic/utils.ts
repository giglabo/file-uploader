export function isSubset(subset: string[], set: string[]): boolean {
  const setElements = new Set(set);
  for (const element of subset) {
    if (!setElements.has(element)) {
      return false;
    }
  }
  return true;
}
