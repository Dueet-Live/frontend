import localForage from 'localforage';
import { extendPrototype } from 'localforage-observable';
import Observable from 'zen-observable';

export const GENRES = 'genres';
export const SONGS = 'songs';

let localforage = extendPrototype(localForage);
localforage.newObservable.factory = function (subscribeFn) {
  // any is necessary due to a type mismatch. zen-observable
  // Observable expects a subscribe function that includes
  // a closed field in the parameter object. The type
  // provided by localforage-observable is a subset of the expected
  // object, so there is no issue with this.
  return new Observable(subscribeFn as any);
};

export default localforage;
