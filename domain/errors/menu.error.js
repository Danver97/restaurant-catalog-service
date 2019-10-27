const ExtendableError = require('../../lib/errors/extendable_error');

const errorsTypes = {
    paramError: {
        code: 0,
        name: 'paramError',
    },
    sectionNotFound: {
        code: 10,
        name: 'sectionNotFound',
    },
    sectionAlreadyPresent: {
        code: 11,
        name: 'sectionAlreadyPresent',
    },
    dishNotFound: {
        code: 20,
        name: 'dishNotFound',
    },
    dishAlreadyPresent: {
        code: 21,
        name: 'dishAlreadyPresent',
    },
};

class MenuError extends ExtendableError {
    
    static get errors() {
        return errorsTypes;
    }

    static paramError(msg) {
        return new MenuError(msg, MenuError.paramErrorCode);
    }

    static sectionNotFound(msg) {
        return new MenuError(msg, MenuError.sectionNotFoundCode);
    }

    static sectionAlreadyPresent(msg) {
        return new MenuError(msg, MenuError.sectionAlreadyPresentCode);
    }

    static dishNotFound(msg) {
        return new MenuError(msg, MenuError.dishNotFoundCode);
    }

    static dishAlreadyPresent(msg) {
        return new MenuError(msg, MenuError.dishAlreadyPresentCode);
    }

    static get paramErrorCode() {
        return errorsTypes.paramError.code;
    }

    static get sectionNotFoundCode() {
        return errorsTypes.sectionNotFound.code;
    }

    static get sectionAlreadyPresentCode() {
        return errorsTypes.sectionAlreadyPresent.code;
    }

    static get dishNotFoundCode() {
        return errorsTypes.dishNotFound.code;
    }

    static get dishAlreadyPresentCode() {
        return errorsTypes.dishAlreadyPresent.code;
    }
}

module.exports = MenuError;
