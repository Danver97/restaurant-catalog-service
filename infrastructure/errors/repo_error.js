const ExtendableError = require('../../lib/errors/extendable_error');

class RepositoryError extends ExtendableError {}

module.exports = RepositoryError;
