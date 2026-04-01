export declare class IyzicoClient {
    private apiKey;
    private secretKey;
    private baseUrl;
    constructor();
    private generateAuthorizationHeader;
    request(method: string, path: string, body?: unknown): Promise<unknown>;
}
