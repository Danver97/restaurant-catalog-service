const assert = require('assert');
const Location = require('../../domain/models/location');


describe('Menu module unit test', () => {
    const coords = {
        lat: 44.021651,
        lon: 7.021651,
    };
    const address = 'via Roma 1, Fossano, Italia';

    it('check if constructor works', () => {
        assert.throws(() => new Location());
        assert.throws(() => new Location('a'));
        assert.throws(() => new Location(coords));
        assert.throws(() => new Price(coords, 3));
        assert.throws(() => new Location({ lat: 98.0, lon: 44.0 }, 'aaa'));
        assert.throws(() => new Location({ lat: 12.0, lon: 270.0 }, 'aaa'));

        const loc = new Location(coords, address);
        assert.deepStrictEqual(loc.coordinates, coords)
        assert.strictEqual(loc.address, address);
    });
});