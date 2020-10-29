/** A quasi-queue. In particular, no elements can be added to the queue after it has been initialised. */
export class Queue<T> {
  queue: T[];

  constructor(elements: T[]) {
    this.queue = [...elements];
    this.queue.reverse();
  }

  /** Returns the first value in the queue. */
  peek() {
    return this.queue.length === 0 ? null : this.queue[this.queue.length - 1];
  }

  /** Returns and removes the first value in the queue. */
  pop() {
    return this.queue.length === 0 ? null : this.queue.pop();
  }

  /** Returns `true` if the queue is empty. */
  isEmpty() {
    return this.queue.length === 0;
  }
}
