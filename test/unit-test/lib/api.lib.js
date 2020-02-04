async function runRequests(req, inputs) {
    const { url, method, headers, requests } = inputs;
    for (r of requests) {
        const request = req[r.method || method](r.url || url);
        setHeaders(request, headers);
        setHeaders(request, r.headers);
        setBody(request, r.body);
        setExpectBody(request, r.expectBody);
        setExpectCode(request, r.expectCode);
        try {
            await request;
        } catch (error) {
            console.log('Test case:');
            console.log(Object.assign({ url, method, headers }, r));
            throw error;
        }
    }
}

function setHeaders(request, headers) {
    if (headers)
        Object.entries(headers).forEach((entry) => request.set(entry[0],entry[1]));
}
function setBody(request, body) {
    if (body)
        request.send(body)
}
function setExpectBody(request, expectBody) {
    if (expectBody)
        request.expect(expectBody)
}
function setExpectCode(request, code) {
    if (code)
        request.expect(code)
}

module.exports = {
    runTest: runRequests
};
