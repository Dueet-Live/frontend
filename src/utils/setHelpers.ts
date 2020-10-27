export function isEqual(set1: Set<any>, set2: Set<any>) {
  if (set1.size !== set2.size) {
    return false;
  }

  for (let val of Array.from(set1)) {
    if (!set2.has(val)) {
      return false;
    }
  }

  return true;
}
