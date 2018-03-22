export interface Headers {
  [key: string]: string
}

export type Param = string | number | Date | null

export interface Params {
  [key: string]: Param | Param[]
}

export interface Config {
  data?: any // `data` is the data to be sent as the request body.
  headers?: Headers // `headers` are custom headers to be sent.
  params?: Params // `params` are the URL parameters to be sent with the request.
  timeout?: number // `timeout` specifies the number of milliseconds before the request times out.
}

const defaultHeaders: Headers = {}

export function setDefaultHeaders(headers: { [key: string]: string }) {
  Object.keys(headers).forEach(key => {
    defaultHeaders[key] = headers[key]
  })
}

export class Response<T, S> {
  public data: T
  public status: number
  public statusText: string
  public headers: Headers
  public config: Config
  public request: XMLHttpRequest
  public isSuccess: S

  constructor(xhr: XMLHttpRequest, config: Config, isSuccess: S) {
    this.data = this.parseResponse(xhr.response)
    this.status = xhr.status
    this.statusText = xhr.statusText
    this.headers = this.parseHeaders(xhr.getAllResponseHeaders().split("\n"))
    this.request = xhr
    this.config = config
    this.isSuccess = isSuccess
  }

  private parseResponse(data: any) {
    if (typeof data === "string") {
      try {
        data = JSON.parse(data)
      } catch (e) {
        /* Ignore */
      }
    }
    return data
  }

  private parseHeaders(lines: string[]): Headers {
    return lines.reduce((headers: Headers, line) => {
      const kv = line.split(":", 2)
      const key = kv[0].trim().toLocaleLowerCase()
      const value = kv[1] ? kv[1].trim() : ""
      if (key) {
        headers[key] = headers[key] ? `${headers[key]}, ${value}` : value
      }
      return headers
    }, {})
  }
}

class RequestError extends Error {
  public config: Config
  public code: string | null | undefined
  public request: XMLHttpRequest

  constructor(
    message: string,
    config: Config,
    code: string | null | undefined,
    req: XMLHttpRequest,
  ) {
    super(message)
    this.config = config
    this.code = code
    this.request = req
  }
}

// Bulid a URL by appending params to the end.
export function buildUrl(url: string, params: Params): string {
  const parts: string[] = []
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      let value = params[key]
      if (Array.isArray(value)) {
        key += "[]"
      } else {
        value = [value]
      }
      for (let v of value) {
        if (v == null) {
          continue
        } else if (v instanceof Date) {
          v = v.toISOString()
        }
        parts.push(`${key}=${encodeURIComponent(v.toString())}`)
      }
    }
  }
  return parts.length
    ? url + (url.indexOf("?") === -1 ? "?" : "&") + parts.join("&")
    : url
}

export function request<T = any, F = any>(
  method: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH",
  url: string,
  config: Config = {},
): Promise<Response<T, true> | Response<F, false>> {
  return new Promise((resolve, reject) => {
    let xhr: XMLHttpRequest | null = new XMLHttpRequest()

    const headers: { [key: string]: string } = {
      ...defaultHeaders,
      ...config.headers,
    }

    xhr.open(method, config.params ? buildUrl(url, config.params) : url, true)
    xhr.onload = () => {
      if (xhr) {
        resolve(new Response(
          xhr,
          config,
          200 <= xhr.status && xhr.status < 300,
        ) as any)
        xhr = null // Clean up to fix circular reference in order to avoid memory leak
      }
    }
    xhr.onerror = () => {
      if (xhr) {
        reject(new RequestError("Network Error", config, null, xhr))
        xhr = null
      }
    }
    xhr.ontimeout = () => {
      if (xhr && config.timeout) {
        reject(
          new RequestError(
            `Timeout of ${config.timeout} ms exceeded`,
            config,
            "ECONNABORTED",
            xhr,
          ),
        )
        xhr = null
      }
    }
    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key])
      }
    }
    if (config.timeout) {
      xhr.timeout = config.timeout
    }

    let configData = config.data
    if (
      typeof configData === "object" &&
      headers["Content-Type"] === "application/json;charset=UTF-8"
    ) {
      configData = JSON.stringify(configData)
    }

    xhr.send(configData !== undefined ? configData : null)
  })
}
