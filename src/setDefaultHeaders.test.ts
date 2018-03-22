import mock from "xhr-mock"
import { request, setDefaultHeaders } from "./index"

describe("setDefualtHeaders", () => {
  beforeEach(() => mock.setup())
  afterEach(() => mock.teardown())

  it("sets default headers", async done => {
    expect.assertions(3)

    mock.get("/before", (req, res) => {
      expect(req.header("foo")).toBeNull()
      return res
    })
    mock.get("/after", (req, res) => {
      expect(req.header("foo")).toEqual("bar")
      expect(req.header("hoge")).toEqual("override")
      return res
    })

    await request("GET", "/before")
    setDefaultHeaders({ foo: "bar", hoge: "piyo" })
    await request("GET", "/after", { headers: { hoge: "override" } })

    done()
  })
})
