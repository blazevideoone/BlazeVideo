var {google} = require('googleapis');
var config = require('config');

const API_KEY = config.oracle.google_api_key;

/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

module.exports = {
  YOUTUBE_PREFIX: "YUTB_",

  getVideoStatistics: function(videoId) {
    return new Promise(function(resolve, reject) {
      var service = google.youtube('v3');
      var parameters = {
        "id": videoId,
        "part": "statistics",
        "key": API_KEY
      };
      service.videos.list(parameters, function(err, response) {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.data.items);
      });
    })
  }
}
