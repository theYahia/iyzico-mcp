# iyzico-mcp

MCP server for iyzico payment gateway (Turkey). Supports payments, refunds, checkout forms, sub-merchants, and 3D Secure via HMAC authentication.

## Tools (8)

| Tool | Description |
|---|---|
| `create_payment` | Create a payment with card details |
| `retrieve_payment` | Get payment details by ID |
| `cancel_payment` | Cancel a payment |
| `refund_payment` | Refund a payment transaction |
| `create_checkout_form` | Create a hosted checkout form |
| `retrieve_checkout_form` | Get checkout form result by token |
| `create_sub_merchant` | Register a sub-merchant for marketplace |
| `create_threeds_payment` | Initialize a 3D Secure payment |

## Quick Start

```json
{
  "mcpServers": {
    "iyzico": {
      "command": "npx",
      "args": ["-y", "@theyahia/iyzico-mcp"],
      "env": {
        "IYZICO_API_KEY": "<YOUR_API_KEY>",
        "IYZICO_SECRET_KEY": "<YOUR_SECRET_KEY>"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IYZICO_API_KEY` | Yes | API key from iyzico dashboard |
| `IYZICO_SECRET_KEY` | Yes | Secret key from iyzico dashboard |
| `IYZICO_SANDBOX` | No | Set to "true" to use sandbox API |

## Demo Prompts

- "Create a payment of 100 TRY for an online order"
- "Check the status of payment pay_abc123"
- "Cancel payment pay_xyz789"
- "Refund 50 TRY from transaction pt_001"
- "Create a checkout form for 250 TRY with callback to https://myshop.com/done"
- "Register a new sub-merchant for my marketplace"

## License

MIT
