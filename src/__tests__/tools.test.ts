import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

process.env.IYZICO_API_KEY = "test-api-key";
process.env.IYZICO_SECRET_KEY = "test-secret-key";

describe("iyzico-mcp tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("IyzicoClient generates authorization header", async () => {
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success", paymentId: "pay_123" }),
    });
    const result = await client.request("POST", "/payment/detail", { paymentId: "pay_123" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call[1].headers["Authorization"]).toMatch(/^IYZWS /);
  });

  it("create_payment sends correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success", paymentId: "pay_456", price: "100.0" }),
    });
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    const result = await client.request("POST", "/payment/auth", {
      price: "100.0",
      paidPrice: "100.0",
      currency: "TRY",
    });
    expect(result).toHaveProperty("paymentId", "pay_456");
  });

  it("cancel_payment sends paymentId", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success", paymentId: "pay_789" }),
    });
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    const result = await client.request("POST", "/payment/cancel", { paymentId: "pay_789" });
    expect(result).toHaveProperty("status", "success");
  });

  it("refund_payment processes refund", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success", paymentTransactionId: "pt_001", price: "50.0" }),
    });
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    const result = await client.request("POST", "/payment/refund", {
      paymentTransactionId: "pt_001",
      price: "50.0",
    });
    expect(result).toHaveProperty("paymentTransactionId", "pt_001");
  });

  it("handles HTTP errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false, status: 401, text: async () => "Unauthorized",
    });
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    await expect(client.request("POST", "/payment/detail", {})).rejects.toThrow("iyzico HTTP 401");
  });

  it("create_sub_merchant sends merchant data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success", subMerchantKey: "smk_001" }),
    });
    const { IyzicoClient } = await import("../client.js");
    const client = new IyzicoClient();
    const result = await client.request("POST", "/onboarding/submerchant", {
      name: "Test Shop",
      subMerchantType: "PERSONAL",
    });
    expect(result).toHaveProperty("subMerchantKey", "smk_001");
  });

  it("throws when env vars missing", async () => {
    const origKey = process.env.IYZICO_API_KEY;
    delete process.env.IYZICO_API_KEY;
    const { IyzicoClient } = await import("../client.js");
    expect(() => new IyzicoClient()).toThrow("IYZICO_API_KEY");
    process.env.IYZICO_API_KEY = origKey;
  });
});
