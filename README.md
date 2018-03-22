# @increments/request

[![NPM version](http://img.shields.io/npm/v/@increments/request.svg)](https://www.npmjs.com/package/@increments/request)
[![Build Status](https://travis-ci.org/increments/request-js.svg?branch=master)](https://travis-ci.org/increments/request-js)
[![Maintainability](https://api.codeclimate.com/v1/badges/dca6d5ac58fdbf205834/maintainability)](https://codeclimate.com/github/increments/request-js/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/dca6d5ac58fdbf205834/test_coverage)](https://codeclimate.com/github/increments/request-js/test_coverage)
[![Stable Release Size](http://img.badgesize.io/https://unpkg.com/@increments/request/dist/request.es5.min.js?compression=gzip)](https://github.com/ngryman/badge-size)

Minimalistic XHR wrapper. Zero dependency.

## Installation

If your project is using npm, you can install [@increments/request](https://www.npmjs.com/package/@increments/request) package by npm command:

```bash
npm install --save @increments/request
# or
yarn add @increments/request
```

### Distribution files

- **dist/index.js** -  The CommonJS version of this package. (default)
- **dist/index.es.js** -  The native modules version of this package.
- **dist/request.es5.js** - ES5 / UMD version of this package. This version exports itself to `window.Request`.

## Synopsis

```js
import { request } from "@increments/request"

request("POST", "/api/endpoint", {
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json;charset=UTF-8"
  },
  data: requestPayload
}).then(response => {
  //
}).catch(error => {
  //
})

```

### TypeScript

```ts
// Declare type of response.data
request<
  { users: { name: string }[] },
  { errors: { message: string }[] }
>("GET", "/users")
  .then(response => {
    if (response.isSuccess) {
      console.log(response.data.users[0].name) // Show first user's name.
    } else {
      console.log(response.data.errors[0].message) // Show first error message.
    }
  })
```
