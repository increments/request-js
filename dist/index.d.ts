export interface Headers {
    [key: string]: string;
}
export declare type Param = string | number | Date | null;
export interface Params {
    [key: string]: Param | Param[];
}
export interface Config {
    data?: any;
    headers?: Headers;
    params?: Params;
    timeout?: number;
}
export declare function setDefaultHeaders(headers: {
    [key: string]: string;
}): void;
export declare class Response<T, S> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: Config;
    request: XMLHttpRequest;
    isSuccess: S;
    constructor(xhr: XMLHttpRequest, config: Config, isSuccess: S);
    private parseResponse(data);
    private parseHeaders(lines);
}
export declare function buildUrl(url: string, params: Params): string;
export declare function request<T = any, F = any>(method: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH", url: string, config?: Config): Promise<Response<T, true> | Response<F, false>>;
