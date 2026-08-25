import { describe, it, expect, vi } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../../../../tests/setup";
import apiConsts from "../ApiConstants";
import {
  loginUser,
  getUserNames,
  logout,
  getUser,
  deleteUser,
  registerNewUser,
  changeUserMail,
  changeUserName,
  changeUserPassword,
  getUserIds,
  getUserNameSuggestions,
  loginOAuth,
} from "../AuthentificationServices";

const { AUTH_URI, HTTP_METHODS } = apiConsts;

describe("AuthentificationServices", () => {
  it("loginUser POSTs credentials and returns tokens", async () => {
    let body;
    server.use(
      http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.LOGIN}`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ access_token: "at", refresh_token: "rt" });
      })
    );
    const res = await loginUser("a@b.c", "secret");
    expect(res).toEqual({ access_token: "at", refresh_token: "rt" });
    expect(body).toEqual({ email: "a@b.c", password: "secret" });
  });

  it("getUserNames POSTs user ids and resolves names", async () => {
    server.use(
      http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USERNAME}`, () =>
        HttpResponse.json(["Admin", "User"])
      )
    );
    expect(await getUserNames(["u1", "u2"])).toEqual(["Admin", "User"]);
  });

  it("logout GETs the logout endpoint", async () => {
    let path;
    server.use(
      http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.LOGOUT}`, ({ request }) => {
        path = new URL(request.url).pathname;
        return HttpResponse.json({ success: true });
      })
    );
    const res = await logout();
    expect(res).toEqual({ success: true });
    expect(path.endsWith("/auth/logout")).toBe(true);
  });

  it("getUser fetches the current user", async () => {
    server.use(
      http.get(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USER}`, () =>
        HttpResponse.json({ email: "x@y.z", userName: "n" })
      )
    );
    expect(await getUser()).toEqual({ email: "x@y.z", userName: "n" });
  });

  it("deleteUser DELETEs with email payload", async () => {
    let method;
    server.use(
      http.delete(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.DELETE}`, async () => {
        method = "DELETE";
        return HttpResponse.json({});
      })
    );
    await deleteUser("gone@edge-ml.org");
    expect(method).toBe("DELETE");
  });

  it("registerNewUser POSTs registration data", async () => {
    let body;
    server.use(
      http.post(
        `${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.REGISTER}`,
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }
      )
    );
    await registerNewUser("new@edge-ml.org", "pw", "newbie");
    expect(body).toEqual({
      email: "new@edge-ml.org",
      password: "pw",
      userName: "newbie",
    });
  });

  it.each([
    ["changeUserMail", HTTP_METHODS.PUT],
    ["changeUserName", HTTP_METHODS.PUT],
  ])("%s sends a PUT", async (fnName) => {
    const fn = { changeUserMail, changeUserName }[fnName];
    const res = await fn("newValue");
    expect(res).toEqual({ success: true });
  });

  it("changeUserPassword PUTs both passwords", async () => {
    let body;
    server.use(
      http.put(
        `${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.CHANGE_PASSWORD}`,
        async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({});
        }
      )
    );
    await changeUserPassword("old", "new");
    expect(body).toEqual({ password: "old", newPassword: "new" });
  });

  it("getUserIds POSTs user names and returns ids", async () => {
    server.use(
      http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.ID}`, () =>
        HttpResponse.json(["id-a"])
      )
    );
    expect(await getUserIds(["alice"])).toEqual(["id-a"]);
  });

  it("getUserNameSuggestions returns suggestions", async () => {
    server.use(
      http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.USERNAMESUGGEST}`, () =>
        HttpResponse.json(["alice_2"])
      )
    );
    expect(await getUserNameSuggestions("alice")).toEqual(["alice_2"]);
  });

  it("loginOAuth redirects the browser to the OAuth endpoint", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await loginOAuth("google");
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("login/oauth?provider=google"),
      "_self"
    );
    openSpy.mockRestore();
  });

  it("propagates backend errors", async () => {
    server.use(
      http.post(`${AUTH_URI}${apiConsts.AUTH_ENDPOINTS.LOGIN}`, () =>
        HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })
      )
    );
    await expect(loginUser("a@b.c", "wrong")).rejects.toThrow(
      "Invalid credentials"
    );
  });
});
