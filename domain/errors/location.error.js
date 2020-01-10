const ExtendableError = require('../../lib/errors/extendable_error');

const errorsTypes = {
    paramError: {
        code: 0,
        name: 'paramError',
    },
    coordinatesOutOfBounds: {
        code: 10,
        name: 'coordinatesOutOfBounds',
    },
};

class LocationError extends ExtendableError {
    
    static get errors() {
        return errorsTypes;
    }

    static paramError(msg) {
        return new LocationError(msg, MenuError.paramErrorCode);
    }

    static coordinatesOutOfBounds(msg) {
        return new LocationError(msg, MenuError.coordinatesOutOfBounds);
    }
}

module.exports = LocationError;
