# GM_xmlhttpRequest powered implementation of window.fetch

The global `fetch` function is an easier way to make web requests and handle responses than using an XMLHttpRequest.
This implementation uses GM_xmlhttpRequest as the underlying implementation, allowing user scripts to make cross-domain
requests using the fetch API.

GM_fetch.ts differs from upstream GM_fetch by being rewritten in TypeScript and featuring a more consistent API.
GM_fetch is based on [GitHub's fetch polyfill](https://github.com/github/fetch).

## Compatibility

- GM_fetch.ts uses the legacy `GM_xmlhttpRequest` API as opposed to GreaseMonkey 4.0's `GM.xmlHttpRequest` for
  compatibility with a wider variety of userscript engines. As such, while it is compatible with TamperMonkey,
  ViolentMonkey, Scriptish, and legacy GreaseMonkey, it is unlikely to work on GreaseMonkey 4.0.
- The default UTF-8 TextDecoder encoding is used for decoding response ArrayBuffer instances, with the exception of
  `Response.text()`.
- `Response.text()` is untested.
- `Body.formData()` is unsupported for response bodies.
- `request.credentials: 'include'` isn't explicitly implemented.

## Installation

For regular userscripts, without any type of module bundler, you can add an `@require` clause to your script's header
pointing to `dist/GM_fetch.js`. This is a UMD file that will adapt to either RequireJS, AMD, or Webpack, or export a
GM_fetch variable to the current scope. The Headers, Request, and Response classes are only publicly visible if a module
loader is used.

```javascript
// @grant    GM_xmlhttpRequest
// @require  https://www.example.com/some/js/GM_fetch.js
```

Alternatively, for TypeScript projects, you can copy all the files in `src` to your project directly, and import
`./GM_fetch.ts`.

## Usage

The `fetch` function supports the GET, HEAD and POST HTTP methods, as with GM_xmlhttpRequest. Here are some examples.

### HTML

```javascript
fetch('/users.html')
  .then(res => res.text())
  .then(body => document.body.innerHTML = body);
```

### JSON

```javascript
fetch('/users.json')
  .then(res => res.json())
  .then(json => console.log('parsed json', json)
  .catch(err => console.error('parsing failed', err);
```

### Response metadata

```javascript
fetch('/users.json').then(response => {
  console.log(response.headers.get('Content-Type'));
  console.log(response.headers.get('Date'));
  console.log(response.status);
  console.log(response.statusText);
});
```

### Post form

```javascript
var form = document.querySelector('form')

fetch('/query', {
  method: 'post',
  body: new FormData(form)
});
```

### Post JSON

```javascript
fetch('/users', {
  method: 'post',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Hubot',
    login: 'hubot',
  })
});
```

### File upload

```javascript
const input = document.querySelector('input[type="file"]')

const form = new FormData()
form.append('file', input.files[0])
form.append('user', 'hubot')

fetch('/avatars', {
  method: 'post',
  body: form
});
```

### Success and error handlers

This causes `fetch` to behave like jQuery's `$.ajax` by rejecting the `Promise`
on HTTP failure status codes like 404, 500, etc. The response `Promise` is
resolved only on successful, 200 level, status codes.

```javascript
function status(response) {
  if (response.ok) {
    return response;
  }
  throw new Error(response.statusText);
}

fetch('/users')
  .then(status)
  .then(res => res.json())
  .then(json => console.log('request succeeded with json response', json))
  .catch(err => console.log('request failed', err));
```
