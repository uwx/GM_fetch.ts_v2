"use strict";
// https://github.com/mitchellmebane/GM_fetch
//
// Copyright (c) 2015 Mitchell Mebane
// Copyright (c) 2014-2015 GitHub, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Response = exports.Request = exports.Headers = void 0;
exports.GM_fetch = GM_fetch;
function normalizeName(name) {
    if (typeof name !== 'string') {
        name = String(name);
    }
    if (/[^\w#$%&'*+.^`|~-]/i.test(name)) {
        throw new TypeError('Invalid character in header field name');
    }
    return name; // TODO case insensitivity
}
function normalizeValue(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return value;
}
class Headers {
    constructor(headers) {
        this.map = {};
        this.map = {};
        if (headers instanceof Headers) {
            headers.forEach((value, name) => {
                this.append(name, value);
            });
        }
        else if (headers) {
            for (const name of Object.getOwnPropertyNames(headers)) {
                this.append(name, headers[name]);
            }
        }
    }
    append(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        const list = this.map[name];
        if (list === undefined) {
            this.map[name] = [value];
        }
        else {
            list.push(value);
        }
    }
    delete(name) {
        delete this.map[normalizeName(name)];
    }
    get(name) {
        const values = this.map[normalizeName(name)];
        return values ? values[0] : null;
    }
    getAll(name) {
        return this.map[normalizeName(name)] || [];
    }
    has(name) {
        return Object.prototype.hasOwnProperty.call(this.map, normalizeName(name));
    }
    set(name, value) {
        this.map[normalizeName(name)] = [normalizeValue(value)];
    }
    // eslint-disable-next-line unicorn/prevent-abbreviations
    forEach(callback, thisArg) {
        for (const name of Object.getOwnPropertyNames(this.map)) {
            for (const value of this.map[name]) {
                callback.call(thisArg, value, name, this);
            }
        }
    }
    *[Symbol.iterator]() {
        for (const [name, values] of Object.entries(this.map)) {
            for (const value of values) {
                yield [name, value];
            }
        }
    }
}
exports.Headers = Headers;
function fileReaderReady(reader) {
    return new Promise((resolve, reject) => {
        reader.addEventListener('load', () => {
            resolve(reader.result);
        });
        reader.addEventListener('error', () => {
            reject(reader.error);
        });
    });
}
function readBlobAsArrayBuffer(blob) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
}
function readBlobAsText(blob) {
    const reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
}
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
class Body {
    constructor() {
        this._bodyUsed = false;
    }
    get bodyUsed() {
        return this._bodyUsed;
    }
    blob() {
        if (this._bodyUsed) {
            return Promise.reject(new TypeError('Body contents already read'));
        }
        this._bodyUsed = true;
        const body = this.body;
        if (typeof body === 'string' || body instanceof ArrayBuffer) {
            return Promise.resolve(new Blob([body]));
        }
        if (body instanceof Blob) {
            return Promise.resolve(body);
        }
        if (body instanceof FormData) {
            return Promise.reject(new TypeError('A multipart FormData body cannot be read as a blob'));
        }
        if (body === undefined) {
            return Promise.reject(new Error('No body is present'));
        }
        throw new TypeError('Invalid body type');
    }
    arrayBuffer() {
        if (this._bodyUsed) {
            return Promise.reject(new TypeError('Body contents already read'));
        }
        this._bodyUsed = true;
        const body = this.body;
        if (typeof body === 'string') {
            return Promise.resolve(textEncoder.encode(body).buffer);
        }
        if (body instanceof ArrayBuffer) {
            return Promise.resolve(body);
        }
        if (body instanceof Blob) {
            return Promise.resolve(readBlobAsArrayBuffer(body));
        }
        if (body instanceof FormData) {
            return Promise.reject(new TypeError('A multipart FormData body cannot be read as an arrayBuffer'));
        }
        if (body === undefined) {
            return Promise.reject(new Error('No body is present'));
        }
        throw new TypeError('Invalid body type');
    }
    text() {
        if (this._bodyUsed) {
            return Promise.reject(new TypeError('Body contents already read'));
        }
        this._bodyUsed = true;
        const body = this.body;
        if (typeof body === 'string') {
            return Promise.resolve(body);
        }
        if (body instanceof ArrayBuffer) {
            return Promise.resolve(textDecoder.decode(body));
        }
        if (body instanceof Blob) {
            return Promise.resolve(readBlobAsText(body));
        }
        if (body instanceof FormData) {
            return Promise.reject(new TypeError('A multipart FormData body cannot be read as text'));
        }
        if (body === undefined) {
            return Promise.reject(new Error('No body is present'));
        }
        throw new TypeError('Invalid body type');
    }
    formData() {
        if (this._bodyUsed) {
            return Promise.reject(new TypeError('Body contents already read'));
        }
        this._bodyUsed = true;
        const body = this.body;
        if (typeof body === 'string') {
            return Promise.reject(new TypeError('Unsupported: Cannot parse FormData from a string body'));
        }
        if (body instanceof ArrayBuffer) {
            return Promise.reject(new TypeError('Unsupported: Cannot parse FormData from an ArrayBuffer body'));
        }
        if (body instanceof Blob) {
            return Promise.reject(new TypeError('Unsupported: Cannot parse FormData from a Blob body'));
        }
        if (body instanceof FormData) {
            return Promise.resolve(body);
        }
        if (body === undefined) {
            return Promise.reject(new Error('No body is present'));
        }
        throw new TypeError('Invalid body type');
    }
    json() {
        return this.text().then(JSON.parse);
    }
}
// HTTP methods whose capitalization should be normalized
const methods = new Set(['GET', 'HEAD', 'POST']);
function normalizeMethod(method) {
    method = method.toUpperCase();
    if (!methods.has(method)) {
        throw new Error(`Unsupported HTTP method for GM_xmlhttpRequest: ${method}`);
    }
    return method;
}
class Request extends Body {
    constructor(url, options) {
        super();
        options = options || {};
        this.url = url;
        this.credentials = options.credentials || 'omit';
        this.headers = new Headers(options.headers);
        this.method = normalizeMethod(options.method || 'GET');
        this.mode = options.mode || null;
        this.referrer = null;
        if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
        }
        this.bodyStore = options.body;
    }
    get body() {
        return this.bodyStore;
    }
    get bodyRaw() {
        return this.bodyStore;
    }
}
exports.Request = Request;
function headers(responseHeaders) {
    const head = new Headers();
    const pairs = responseHeaders.trim().split('\n');
    for (const header of pairs) {
        const split = header.trim().split(':');
        const key = split.shift().trim();
        const value = split.join(':').trim();
        head.append(key, value);
    }
    return head;
}
class Response extends Body {
    constructor(response) {
        super();
        this.response = response;
        this.type = 'default';
        this.status = response.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = response.statusText;
        this.headers = headers(response.responseHeaders);
        this.url = responseURL(response.finalUrl, response.responseHeaders, this.headers) || '';
    }
    get body() {
        return this.response.response;
    }
    text() {
        if (this._bodyUsed) {
            return Promise.reject(new TypeError('Body contents already read'));
        }
        this._bodyUsed = true;
        return Promise.resolve(this.response.responseText);
    }
}
exports.Response = Response;
function responseURL(finalUrl, rawRespHeaders, respHeaders) {
    if (finalUrl) {
        return finalUrl;
    }
    // Avoid security warnings on getResponseHeader when not allowed by CORS
    if (/^X-Request-URL:/m.test(rawRespHeaders)) {
        return respHeaders.get('X-Request-URL');
    }
    return null;
}
function GM_fetch(input, init) {
    let request;
    if (input instanceof Request) {
        if (init) {
            request = new Request(input.url, init);
        }
        else {
            request = input;
        }
    }
    else {
        request = new Request(input, init);
    }
    if (!['GET', 'HEAD', 'POST'].includes(request.method)) {
        throw new Error('Unsupported method for GM_xmlhttpRequest');
    }
    return new Promise((resolve, reject) => {
        const xhrDetails = {};
        xhrDetails.method = request.method;
        xhrDetails.responseType = 'arraybuffer'; // TODO does this affect presence of responseText?
        xhrDetails.url = request.url;
        // Not supported anymore
        //xhr_details.synchronous = false;
        // eslint-disable-next-line unicorn/prefer-add-event-listener
        xhrDetails.onload = resp => {
            const status = resp.status;
            if (status < 100 || status > 599) {
                reject(new TypeError(`Network request failed: Status code ${status}`));
                return;
            }
            resolve(new Response(resp));
        };
        // eslint-disable-next-line unicorn/prefer-add-event-listener
        xhrDetails.onerror = () => {
            reject(new TypeError('Network request failed'));
        };
        xhrDetails.headers = {};
        for (const [name, value] of request.headers) {
            xhrDetails.headers[name] = value;
        }
        if (typeof request.bodyRaw !== 'undefined') {
            xhrDetails.data = request.bodyRaw; // https://github.com/greasemonkey/greasemonkey/issues/1585 it just WORKS??
        }
        GM_xmlhttpRequest(xhrDetails);
        /*
        // need to see if there's any way of doing this
        if (request.credentials === 'include') {
          xhr.withCredentials = true
        }

        GM_xmlhttpRequest has a responseType param, but this didn't seem to work, at least in TamperMonkey
        if ('responseType' in xhr && support.blob) {
          xhr.responseType = 'blob'
        }
        */
    });
}
//# sourceMappingURL=GM_fetch.js.map