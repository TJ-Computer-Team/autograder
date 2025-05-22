const pl = require('./db');

module.exports = {
    ...require('./problems'),
    ...require('./submissions'),
    ...require('./checkers'),
    ...require('./users'),
    ...require('./contests'),
    pl
};