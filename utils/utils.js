/**
 *  If the given value is not an array and not null, wrap it in one.
 *
 * @param value
 * @returns {Array|*[]}
 */
function arrayWrap(value) {
    if (value instanceof Array) {
        return value;
    }
    if (value === null || void 0 === value) {
        return [];
    }

    return [value];
}

/**
 * Parse json web token
 *
 * @param token
 * @returns {*|null}
 */
function parseJWT(token) {
    if (void 0 === token) {
        return null
    }
    let partials = token.split(' ')
    if (partials.length > 1) {
        token = partials[1]
    }
    return token;
}

/**
 * Format error output
 *
 * @param type
 * @param data
 * @returns {{data, type}}
 */
function formatError(type, data) {
    return {type, data}
}


module.exports = {
    arrayWrap, parseJWT, formatError
}
