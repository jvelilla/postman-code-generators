/**
 * Sanitizes input string by handling escape characters according to request body type
 *
 * @param {String} inputString - Input String to sanitize
 * @param {String} escapeCharFor - Escape character for headers, body: raw, formdata etc.
 * @param {Boolean} [inputTrim] - Indicates whether to trim string or not
 * @returns {String} Sanitized String handling escape characters
 */
function sanitize (inputString, escapeCharFor, inputTrim) {

  if (typeof inputString !== 'string') {
    return '';
  }
  inputString = inputTrim && typeof inputTrim === 'boolean' ? inputString.trim() : inputString;
  if (escapeCharFor && typeof escapeCharFor === 'string') {
    switch (escapeCharFor) {
      case 'raw':
        return JSON.stringify(inputString);
      case 'urlencoded':
        return escape(inputString);
      case 'formdata':
        return inputString.replace(/{/g, '[').replace(/}/g, ']');
        /* istanbul ignore next */
      case 'file':
        return inputString.replace(/{/g, '[').replace(/}/g, ']');
      case 'header':
        return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        /* istanbul ignore next */
      default:
        return inputString.replace(/"/g, '\\"');
    }
  }
  return inputString;
}

/**
 * sanitizes input options
 *
 * @param {Object} options - Options provided by the user
 * @param {Array} optionsArray - options array received from getOptions function
 *
 * @returns {Object} - Sanitized options object
 */
function sanitizeOptions (options, optionsArray) {
  var result = {},
    defaultOptions = {},
    id;
  optionsArray.forEach((option) => {
    defaultOptions[option.id] = {
      default: option.default,
      type: option.type
    };
    if (option.type === 'enum') {
      defaultOptions[option.id].availableOptions = option.availableOptions;
    }
  });

  for (id in options) {
    if (options.hasOwnProperty(id)) {
      if (defaultOptions[id] === undefined) {
        continue;
      }
      switch (defaultOptions[id].type) {
        case 'boolean':
          if (typeof options[id] !== 'boolean') {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        case 'positiveInteger':
          if (typeof options[id] !== 'number' || options[id] < 0) {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        case 'enum':
          if (!defaultOptions[id].availableOptions.includes(options[id])) {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        default:
          result[id] = options[id];
      }
    }
  }

  for (id in defaultOptions) {
    if (defaultOptions.hasOwnProperty(id)) {
      if (result[id] === undefined) {
        result[id] = defaultOptions[id].default;
      }
    }
  }
  return result;
}

/**
 *
 * @param {*} urlObject The request sdk request.url object
 * @returns {String} The final string after parsing all the parameters of the url including 
 * protocol, auth, host, port, path, query, hash
 * This will be used because the url.toString() method returned the URL with non encoded query string
 * and hence a manual call is made to getQueryString() method with encode option set as true.
 */
function getUrlStringfromUrlObject (urlObject) {
  var url = '';
  if (urlObject.protocol) {
    url += (urlObject.protocol.endsWith('://') ? urlObject.protocol : urlObject.protocol + '://');
  }
  if (urlObject.auth && urlObject.auth.user) {
    url = url + ((urlObject.auth.password) ?
      // ==> username:password@
      urlObject.auth.user + ':' + urlObject.auth.password : urlObject.auth.user) + '@';
  }
  if (urlObject.host) {
    url += urlObject.getHost();
  }
  if (urlObject.port) {
    url += ':' + urlObject.port.toString();
  }
  if (urlObject.path) {
    url += urlObject.getPath();
  }
  if (urlObject.query && urlObject.query.count()) {
    let queryString = urlObject.getQueryString({ ignoreDisabled: true, encode: true });
    queryString && (url += '?' + queryString);
  }
  if (urlObject.hash) {
    url += '#' + urlObject.hash;
  }

  return url;
}

module.exports = {
  sanitize: sanitize,
  sanitizeOptions: sanitizeOptions,
  getUrlStringfromUrlObject: getUrlStringfromUrlObject
};
