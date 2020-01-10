class Location {
    constructor(coordinates, address) {
        if (!coordinates || !address)
            throw new RestaurantError(`Missing the following constructor params: ${coordinates ? '' : 'coordinates'}${address ? '' : ' address'}`);
        if (typeof coordinates !== 'object' || (typeof coordinates === 'object' && (!coordinates.lat || !coordinates.lon)))
            throw new RestaurantError(`coordinates must be an object with the following properties:
                lat: float
                lon: float`);
        if (coordinates.lat < -90 || coordinates.lat > 90 || coordinates.lon < -180 || coordinates.lon > 180)
            throw new RestaurantError(`lat should be between -90.0 and 90.0 inclusive.
            lon should be between -180.0 and 180.0 inclusive.`);
        if (typeof address !== 'string')
            throw new RestaurantError(`address must be a string`);
        this.coordinates = coordinates;
        this.address = address;
    }
}

module.exports = Location;
