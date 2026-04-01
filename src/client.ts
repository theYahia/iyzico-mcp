import * as crypto from "node:crypto";

const BASE_URL = "https://api.iyzipay.com";
const SANDBOX_URL = "https://sandbox-api.iyzipay.com";
const TIMEOUT = 15_000;

export class IyzicoClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.IYZICO_API_KEY ?? "";
    this.secretKey = process.env.IYZICO_SECRET_KEY ?? "";
    if (!this.apiKey || !this.secretKey) {
      throw new Error(
        "Environment variables IYZICO_API_KEY and IYZICO_SECRET_KEY are required. " +
        "Get your keys at https://dev.iyzipay.com/"
      );
    }
    this.baseUrl = process.env.IYZICO_SANDBOX === "true" ? SANDBOX_URL : BASE_URL;
  }

  private generateAuthorizationHeader(body: string): string {
    const randomHeaderValue = `${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
    const hashStr = this.apiKey + randomHeaderValue + this.secretKey + body;
    const hash = crypto.createHash("sha1").update(hashStr, "utf8").digest("base64");
    const authorizationParams = `apiKey:${this.apiKey}&randomHeaderValue:${randomHeaderValue}&signature:${hash}`;
    return `IYZWS ${Buffer.from(authorizationParams).toString("base64")}`;
  }

  async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const bodyStr = body ? JSON.stringify(body) : "";

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          "Authorization": this.generateAuthorizationHeader(bodyStr),
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-iyzi-rnd": `${Date.now()}`,
        },
        body: body ? bodyStr : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`iyzico HTTP ${response.status}: ${text}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("iyzico: request timeout (15s). Try again later.");
      }
      throw error;
    }
  }
}
