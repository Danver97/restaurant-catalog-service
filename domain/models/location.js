const LocationError = require('../errors/location.error');

class Location {
    constructor(coordinates, address) {
        if (!coordinates || !address)
            throw LocationError.paramError(`Missing the following constructor params: ${coordinates ? '' : 'coordinates'}${address ? '' : ' address'}`);
        Location.checkCoordinatesValidity(coordinates);
        if (typeof address !== 'string')
            throw LocationError.paramError(`address must be a string`);
        this.coordinates = coordinates;
        this.address = address;
    }

    static fromObject(obj = {}) {
        return new Location(obj.coordinates, obj.address);
    }

    static checkCoordinatesValidity(coordinates) {
        if (typeof coordinates !== 'object' || (typeof coordinates === 'object' && (!coordinates.lat || !coordinates.lon)))
            throw LocationError.paramError(`coordinates must be an object with the following properties:
                lat: float
                lon: float`);
        if (coordinates.lat < -90 || coordinates.lat > 90 || coordinates.lon < -180 || coordinates.lon > 180)
            throw LocationError.coordinatesOutOfBounds(`lat should be between -90.0 and 90.0 inclusive.
            lon should be between -180.0 and 180.0 inclusive.`);
    }
}

module.exports = Location;
