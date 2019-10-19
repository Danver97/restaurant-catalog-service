class Phone {
    constructor(number) {
        if (!(/^\+?[0-9]+$/.test(number))) // TODO: internationalize
            throw new Error(`The number is not formatted in the right way`);
        this.number = number;
    }

    toJSON() {
        return this.number;
    }

    toString() {
        return this.number;
    }
}

module.exports = Phone;
