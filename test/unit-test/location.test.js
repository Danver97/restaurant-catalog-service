const assert = require('assert');
const Location = require('../../domain/models/location');
const LocationError = require('../../domain/errors/location.error');


describe('Menu module unit test', () => {
    const coords = {
        lat: 44.021651,
        lon: 7.021651,
    };
    const address = 'via Roma 1, Fossano, Italia';

    it('check if constructor works', () => {
        assert.throws(() => new Location(), LocationError);
        assert.throws(() => new Location('a'), LocationError);
        assert.throws(() => new Location(coords), LocationError);
        assert.throws(() => new Location(coords, 3), LocationError);
        assert.throws(() => new Location({ lat: 98.0, lon: 44.0 }, 'aaa'), LocationError);
        assert.throws(() => new Location({ lat: 12.0, lon: 270.0 }, 'aaa'), LocationError);

        const loc = new Location(coords, address);
        assert.deepStrictEqual(loc.coordinates, coords)
        assert.strictEqual(loc.address, address);
    });
});