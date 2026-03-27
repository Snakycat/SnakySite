export class Optional<T> {
  private value: T | null;

  private constructor(value: T | null) {
    this.value = value;
  }

  static some<T>(value: T): Optional<T> {
    return new Optional(value);
  }

  static none<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  static from_nullable<T>(value: T | null): Optional<T> {
    if (value === null) {
      return Optional.none();
    } else {
      return Optional.some(value);
    }
  }

  unwrap(): T {
    return this.value!;
  }

  unwrap_or(value: T): T {
    if (this.is_some()) {
      return this.unwrap();
    } else {
      return value;
    }
  }

  is_some(): boolean {
    return this.value !== null;
  }

  is_none(): boolean {
    return this.value === null;
  }

  inspect(fn: (value: T) => void) {
    if (this.is_some()) {
      fn(this.unwrap());
    }
  }

  map<S>(fn: (value: T) => S): Optional<S> {
    if (this.is_some()) {
      return Optional.some(fn(this.unwrap()));
    } else {
      return Optional.none();
    }
  }
}
