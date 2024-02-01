const webpack = require("webpack");
module.exports = function override(config, env) {
  config.resolve.fallback = {
    buffer: false,
    stream: false,
    assert: false,
    util: false,
    url: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
    dns: false,
    http2: false,
    http: false,
    https: false,
    zlib: false,
  };

  return config;
};
