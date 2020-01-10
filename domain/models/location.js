const LocationError = require('../errors/location.error');

class Location {
    constructor(coordinates, address) {
        if (!coordinates || !address)
            throw new LocationError.paramError(`Missing the following constructor params: ${coordinates ? '' : 'coordinates'}${address ? '' : ' address'}`);
        if (typeof coordinates !== 'object' || (typeof coordinates === 'object' && (!coordinates.lat || !coordinates.lon)))
            throw new LocationError.paramError(`coordinates must be an object with the following properties:
                lat: float
                lon: float`);
        if (typeof address !== 'string')
            throw new LocationError.paramError(`address must be a string`);
        if (coordinates.lat < -90 || coordinates.lat > 90 || coordinates.lon < -180 || coordinates.lon > 180)
            throw new LocationError.coordinatesOutOfBounds(`lat should be between -90.0 and 90.0 inclusive.
            lon should be between -180.0 and 180.0 inclusive.`);
        this.coordinates = coordinates;
        this.address = address;
    }
}

module.exports = Location;
