export function isEqual(arrayA: string[], arrayB: string[]) {
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) {
      return false;
    }
  }

  return true;
}

export function difference(arrayA: string[], arrayB: string[]) {
  return arrayA.filter(e => !arrayB.includes(e));
}
