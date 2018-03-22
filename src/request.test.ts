import mock from "xhr-mock"
import { request } from "./index"

describe("request", () => {
  beforeEach(() => mock.setup())
  afterEach(() => mock.teardown())

  it("resolves a response for 200 OK", async done => {
    expect.assertions(4)

    mock.get(
      "/api/users?format=json&date=2017-03-13T15%3A00%3A00.000Z",
      (req, res) => {
        expect(req.header("Content-Type")).toEqual(
          "application/json;charset=UTF-8",
        )
        expect(req.header("Accept")).toEqual("application/json")
        return res
          .status(200)
          .body('{"users":[{"name":"yuku"}]}')
          .headers({ foo: "bar" })
      },
    )

    const response = await request<{ users: { name: string }[] }, null>(
      "GET",
      "/api/users",
      {
        params: {
          format: "json",
          foo: null,
          date: new Date(2017, 2, 14),
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
      },
    )
    if (response.isSuccess) {
      // response.data has `{ users: { name: string }[] }` type
      expect(response.data.users[0].name).toEqual("yuku")
      expect(response.headers).toEqual({ foo: "bar" })
    }
    done()
  })

  it("resolves a response for 400 Bad Request", async done => {
    expect.assertions(4)
    mock.post("/", (req, res) => {
      expect(req.header("Content-Type")).toEqual(
        "application/json;charset=UTF-8",
      )
      expect(req.header("Accept")).toEqual("application/json")
      expect(req.body()).toEqual('{"hello":"world"}')
      return res.status(400).body('{"errors":[{"message":"Bad Request"}]}')
    })
    const response = await request<null, { errors: { message: string }[] }>(
      "POST",
      "/",
      {
        data: {
          hello: "world",
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json;charset=UTF-8",
        },
      },
    )
    if (!response.isSuccess) {
      // esponse.data has `{ errors: { message: string }[] }` type
      expect(response.data.errors[0].message).toEqual("Bad Request")
    }
    done()
  })

  it("handles error", async done => {
    expect.assertions(1)
    mock.get("/", () => Promise.reject(null))
    try {
      await request("GET", "/")
    } catch (e) {
      expect(e.message).toEqual("Network Error")
    }
    done()
  })

  it("handles timeout", async done => {
    mock.get("/", () => new Promise(() => null))

    try {
      await request("GET", "/", { timeout: 1 })
    } catch (e) {
      expect(e.message).toEqual("Timeout of 1 ms exceeded")
    }
    done()
  })
})
