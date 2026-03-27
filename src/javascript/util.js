export class Optional {
    constructor(value) {
        this.value = value;
    }
    static some(value) {
        return new Optional(value);
    }
    static none() {
        return new Optional(null);
    }
    static from_nullable(value) {
        if (value === null) {
            return Optional.none();
        }
        else {
            return Optional.some(value);
        }
    }
    unwrap() {
        return this.value;
    }
    unwrap_or(value) {
        if (this.is_some()) {
            return this.unwrap();
        }
        else {
            return value;
        }
    }
    is_some() {
        return this.value !== null;
    }
    is_none() {
        return this.value === null;
    }
    inspect(fn) {
        if (this.is_some()) {
            fn(this.unwrap());
        }
    }
    map(fn) {
        if (this.is_some()) {
            return Optional.some(fn(this.unwrap()));
        }
        else {
            return Optional.none();
        }
    }
}
