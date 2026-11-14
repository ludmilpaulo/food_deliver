import {
  confirmLoginMfaSetup,
  loginUserService,
  MFA_SETUP_REQUIRED_PREFIX,
  startLoginMfaSetup,
} from "@/services/authService";

function mockFetch(status: number, body: Record<string, unknown>) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("login MFA enrollment", () => {
  it("hands the setup token to the page when enrollment is required", async () => {
    mockFetch(200, { mfa_setup_required: true, mfa_token: "setup-tok", detail: "MFA enrollment is required" });
    await expect(loginUserService("ludmil", "pw")).rejects.toThrow(`${MFA_SETUP_REQUIRED_PREFIX}setup-tok`);
  });

  it("starts and confirms enrollment with the setup token", async () => {
    const fetchMock = mockFetch(200, { secret: "ABC", otpauth_uri: "otpauth://totp/x" });
    await expect(startLoginMfaSetup("setup-tok")).resolves.toEqual({ secret: "ABC", otpauth_uri: "otpauth://totp/x" });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/auth\/mfa\/setup-token\/$/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ mfa_token: "setup-tok" });

    const confirmMock = mockFetch(200, { enabled: true });
    await confirmLoginMfaSetup("setup-tok", "123456");
    expect(confirmMock.mock.calls[0][0]).toMatch(/\/api\/auth\/mfa\/confirm\/$/);
    expect(JSON.parse(confirmMock.mock.calls[0][1].body)).toEqual({ mfa_token: "setup-tok", code: "123456" });
  });

  it("surfaces the API's message when the code is wrong", async () => {
    mockFetch(400, { detail: "Invalid authenticator code." });
    await expect(confirmLoginMfaSetup("setup-tok", "000000")).rejects.toThrow("Invalid authenticator code.");
  });
});
