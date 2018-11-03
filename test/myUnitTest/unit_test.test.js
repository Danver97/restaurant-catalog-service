// "pretest": "./node_modules/.bin/eslint --ignore-path .eslintignore .",
// "test": "node ./test/unit_test.test"

if(process.env.NODE_TEST_TYPE === 'mytest') {
    const tableTest = require('./table.test');

    if (!tableTest.success) { throw new Error('UNIT TEST: FAILED.'); }

    const restaurantTest = require('./restaurant.test');

    if (!restaurantTest.success) { throw new Error('UNIT TEST: FAILED.'); }

    const testdbTest = require('./repositoryManager.test');

    if (!testdbTest.success) { throw new Error('UNIT TEST: FAILED.'); }

    console.log('UNIT TEST: SUCCESS.');
}
