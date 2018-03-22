var Request = (function (exports) {
  'use strict';

  const defaultHeaders = {};
  function setDefaultHeaders(headers) {
      Object.keys(headers).forEach(key => {
          defaultHeaders[key] = headers[key];
      });
  }
  class Response {
      constructor(xhr, config) {
          this.data = this.parseResponse(xhr.response);
          this.status = xhr.status;
          this.statusText = xhr.statusText;
          this.headers = this.parseHeaders(xhr.getAllResponseHeaders().split("\n"));
          this.request = xhr;
          this.config = config;
      }
      isSuccess() {
          return 200 <= this.status && this.status < 300;
      }
      parseResponse(data) {
          if (typeof data === "string") {
              try {
                  data = JSON.parse(data);
              }
              catch (e) {
                  /* Ignore */
              }
          }
          return data;
      }
      parseHeaders(lines) {
          return lines.reduce((headers, line) => {
              const kv = line.split(":", 2);
              const key = kv[0].trim().toLocaleLowerCase();
              const value = kv[1] ? kv[1].trim() : "";
              if (key) {
                  headers[key] = headers[key] ? `${headers[key]}, ${value}` : value;
              }
              return headers;
          }, {});
      }
  }
  class RequestError extends Error {
      constructor(message, config, code, req) {
          super(message);
          this.config = config;
          this.code = code;
          this.request = req;
      }
  }
  // Bulid a URL by appending params to the end.
  function buildUrl(url, params) {
      const parts = [];
      for (let key in params) {
          if (params.hasOwnProperty(key)) {
              let value = params[key];
              if (Array.isArray(value)) {
                  key += "[]";
              }
              else {
                  value = [value];
              }
              for (let v of value) {
                  if (v == null) {
                      continue;
                  }
                  else if (v instanceof Date) {
                      v = v.toISOString();
                  }
                  parts.push(`${key}=${encodeURIComponent(v.toString())}`);
              }
          }
      }
      return parts.length
          ? url + (url.indexOf("?") === -1 ? "?" : "&") + parts.join("&")
          : url;
  }
  function request(method, url, config = {}) {
      return new Promise((resolve, reject) => {
          let xhr = new XMLHttpRequest();
          const headers = Object.assign({}, defaultHeaders, config.headers);
          xhr.open(method, config.params ? buildUrl(url, config.params) : url, true);
          xhr.onload = () => {
              if (xhr) {
                  resolve(new Response(xhr, config));
                  xhr = null; // Clean up to fix circular reference in order to avoid memory leak
              }
          };
          xhr.onerror = () => {
              if (xhr) {
                  reject(new RequestError("Network Error", config, null, xhr));
                  xhr = null;
              }
          };
          xhr.ontimeout = () => {
              if (xhr && config.timeout) {
                  reject(new RequestError(`Timeout of ${config.timeout} ms exceeded`, config, "ECONNABORTED", xhr));
                  xhr = null;
              }
          };
          for (const key in headers) {
              if (headers.hasOwnProperty(key)) {
                  xhr.setRequestHeader(key, headers[key]);
              }
          }
          if (config.timeout) {
              xhr.timeout = config.timeout;
          }
          let configData = config.data;
          if (typeof configData === "object" &&
              headers["Content-Type"] === "application/json;charset=UTF-8") {
              configData = JSON.stringify(configData);
          }
          xhr.send(configData !== undefined ? configData : null);
      });
  }

  exports.setDefaultHeaders = setDefaultHeaders;
  exports.Response = Response;
  exports.buildUrl = buildUrl;
  exports.request = request;

  return exports;

}({}));
//# sourceMappingURL=request.es5.js.map
