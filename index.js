const ENV = require('./src/env');
const app = require('./src/app');

app.listen(ENV.port, () => {
    console.log(`Server started on port ${ENV.port}`);
});
