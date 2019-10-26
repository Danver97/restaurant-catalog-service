const assert = require('assert');

function assertStrictEqual(actual, expected) {
    const current = Object.assign({}, actual);
    const expect = Object.assign({}, expected);
    Object.keys(current).forEach(k => {
        if (/_.*/.test(k))
            delete current[k];
    });
    Object.keys(expect).forEach(k => {
        if (/_.*/.test(k))
            delete expect[k];
    });
    // assert.strictEqual(JSON.stringify(current), JSON.stringify(expect));
    assert.deepStrictEqual(current, expect);
}

const delayedTestSync = (test, ms) => function (done) {
    this.timeout(2000 + ms);
    setTimeout(() => {
        test();
        done();
    }, ms);
};

const delayedTestAsync = (test, ms) => function (done) {
    this.timeout(2000 + ms);
    setTimeout(async () => {
        await test();
        done();
    }, ms);
};

module.exports = {
    assertStrictEqual,
    delayedTestSync,
    delayedTestAsync,
};
