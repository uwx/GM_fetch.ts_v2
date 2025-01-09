import type { GM_Types } from './tampermonkey-module';
type known = string | number | boolean | symbol | bigint | object | null | undefined;
export declare class Headers {
    private map;
    constructor(headers?: Headers | Record<string, known>);
    append(name: known, value: known): void;
    delete(name: known): void;
    get(name: known): string | null;
    getAll(name: known): string[];
    has(name: known): boolean;
    set(name: known, value: known): void;
    forEach(callback: (value: string, name: string, thisArg: this) => void, thisArg?: unknown): void;
    [Symbol.iterator](): Iterator<[name: string, value: string]>;
}
declare abstract class Body {
    protected _bodyUsed: boolean;
    protected abstract get body(): string | ArrayBuffer | Blob | FormData | undefined;
    get bodyUsed(): boolean;
    blob(): Promise<Blob>;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    formData(): Promise<FormData>;
    json(): Promise<any>;
}
interface RequestOptions {
    readonly credentials?: string;
    readonly headers?: Headers | Record<string, known>;
    readonly method?: string;
    readonly mode?: string;
    readonly body?: string | Blob | FormData;
}
export declare class Request extends Body {
    readonly url: string;
    readonly credentials: string;
    readonly headers: Headers;
    readonly method: string;
    readonly mode: string | null;
    readonly referrer: null;
    private readonly bodyStore?;
    constructor(url: string, options?: RequestOptions);
    protected get body(): string | ArrayBuffer | Blob | FormData | undefined;
    get bodyRaw(): string | Blob | FormData | undefined;
}
export declare class Response extends Body {
    private readonly response;
    readonly type: string;
    readonly url: string;
    readonly status: number;
    readonly ok: boolean;
    readonly statusText: string;
    readonly headers: Headers;
    constructor(response: GM_Types.XHRResponse<unknown>);
    protected get body(): string | ArrayBuffer | Blob | FormData | undefined;
    text(): Promise<string>;
}
export default function GM_fetch(input: string | Request, init?: RequestOptions): Promise<Response>;
export {};
