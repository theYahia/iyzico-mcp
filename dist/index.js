#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { IyzicoClient } from "./client.js";
const server = new McpServer({ name: "iyzico-mcp", version: "1.0.0" });
function getClient() {
    return new IyzicoClient();
}
// Tool 1: create_payment
server.tool("create_payment", "Create a payment via iyzico", {
    price: z.string().describe("Payment amount (e.g. '1.0')"),
    paid_price: z.string().describe("Paid price including commission"),
    currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY").describe("Currency"),
    installment: z.number().int().default(1).describe("Installment count"),
    basket_id: z.string().optional().describe("Basket ID"),
    payment_card: z.object({
        card_holder_name: z.string().describe("Name on card"),
        card_number: z.string().describe("Card number"),
        expire_month: z.string().describe("Expiry month (MM)"),
        expire_year: z.string().describe("Expiry year (YYYY)"),
        cvc: z.string().describe("CVC code"),
    }).describe("Payment card details"),
    buyer: z.object({
        id: z.string().describe("Buyer ID"),
        name: z.string().describe("First name"),
        surname: z.string().describe("Last name"),
        email: z.string().describe("Email"),
        ip: z.string().describe("IP address"),
        city: z.string().optional().describe("City"),
        country: z.string().optional().describe("Country"),
    }).describe("Buyer information"),
}, async (params) => {
    const client = getClient();
    const body = {
        locale: "tr",
        price: params.price,
        paidPrice: params.paid_price,
        currency: params.currency,
        installment: params.installment,
        basketId: params.basket_id,
        paymentCard: {
            cardHolderName: params.payment_card.card_holder_name,
            cardNumber: params.payment_card.card_number,
            expireMonth: params.payment_card.expire_month,
            expireYear: params.payment_card.expire_year,
            cvc: params.payment_card.cvc,
            registerCard: "0",
        },
        buyer: {
            id: params.buyer.id,
            name: params.buyer.name,
            surname: params.buyer.surname,
            email: params.buyer.email,
            ip: params.buyer.ip,
            city: params.buyer.city ?? "Istanbul",
            country: params.buyer.country ?? "Turkey",
            registrationAddress: "N/A",
            identityNumber: "00000000000",
        },
        basketItems: [{ id: "BI101", name: "Product", category1: "Default", itemType: "PHYSICAL", price: params.price }],
        shippingAddress: { contactName: `${params.buyer.name} ${params.buyer.surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
        billingAddress: { contactName: `${params.buyer.name} ${params.buyer.surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
    };
    const result = await client.request("POST", "/payment/auth", body);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 2: retrieve_payment
server.tool("retrieve_payment", "Retrieve payment details by ID", {
    payment_id: z.string().describe("Payment ID to retrieve"),
}, async (params) => {
    const client = getClient();
    const result = await client.request("POST", "/payment/detail", { paymentId: params.payment_id, locale: "tr" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 3: cancel_payment
server.tool("cancel_payment", "Cancel a payment", {
    payment_id: z.string().describe("Payment ID to cancel"),
    ip: z.string().default("127.0.0.1").describe("IP address"),
}, async (params) => {
    const client = getClient();
    const result = await client.request("POST", "/payment/cancel", { paymentId: params.payment_id, ip: params.ip, locale: "tr" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 4: refund_payment
server.tool("refund_payment", "Refund a payment", {
    payment_transaction_id: z.string().describe("Payment transaction ID"),
    price: z.string().describe("Amount to refund"),
    ip: z.string().default("127.0.0.1").describe("IP address"),
}, async (params) => {
    const client = getClient();
    const result = await client.request("POST", "/payment/refund", {
        paymentTransactionId: params.payment_transaction_id,
        price: params.price,
        ip: params.ip,
        locale: "tr",
    });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 5: create_checkout_form
server.tool("create_checkout_form", "Create a checkout form for hosted payment", {
    price: z.string().describe("Total price"),
    paid_price: z.string().describe("Paid price"),
    currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY").describe("Currency"),
    basket_id: z.string().optional().describe("Basket ID"),
    callback_url: z.string().url().describe("Callback URL after payment"),
    buyer_id: z.string().describe("Buyer ID"),
    buyer_name: z.string().describe("Buyer first name"),
    buyer_surname: z.string().describe("Buyer last name"),
    buyer_email: z.string().describe("Buyer email"),
    buyer_ip: z.string().default("127.0.0.1").describe("Buyer IP"),
}, async (params) => {
    const client = getClient();
    const body = {
        locale: "tr",
        price: params.price,
        paidPrice: params.paid_price,
        currency: params.currency,
        basketId: params.basket_id,
        callbackUrl: params.callback_url,
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: { id: params.buyer_id, name: params.buyer_name, surname: params.buyer_surname, email: params.buyer_email, ip: params.buyer_ip, registrationAddress: "N/A", city: "Istanbul", country: "Turkey", identityNumber: "00000000000" },
        basketItems: [{ id: "BI101", name: "Product", category1: "Default", itemType: "PHYSICAL", price: params.price }],
        shippingAddress: { contactName: `${params.buyer_name} ${params.buyer_surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
        billingAddress: { contactName: `${params.buyer_name} ${params.buyer_surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
    };
    const result = await client.request("POST", "/payment/iyzipos/checkoutform/initialize/auth/ecom", body);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 6: retrieve_checkout_form
server.tool("retrieve_checkout_form", "Retrieve checkout form result by token", {
    token: z.string().describe("Checkout form token"),
}, async (params) => {
    const client = getClient();
    const result = await client.request("POST", "/payment/iyzipos/checkoutform/auth/ecom/detail", { token: params.token, locale: "tr" });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 7: create_sub_merchant
server.tool("create_sub_merchant", "Create a sub-merchant for marketplace", {
    name: z.string().describe("Sub-merchant name"),
    email: z.string().describe("Contact email"),
    gsm_number: z.string().optional().describe("GSM phone number"),
    address: z.string().describe("Address"),
    iban: z.string().describe("IBAN for payouts"),
    sub_merchant_type: z.enum(["PERSONAL", "PRIVATE_COMPANY", "LIMITED_OR_JOINT_STOCK_COMPANY"]).describe("Legal entity type"),
    tax_office: z.string().optional().describe("Tax office name"),
    legal_company_title: z.string().optional().describe("Legal company name"),
    identity_number: z.string().describe("Turkish identity number or tax ID"),
    external_id: z.string().describe("Your external ID for this sub-merchant"),
}, async (params) => {
    const client = getClient();
    const body = {
        locale: "tr",
        conversationId: `sm_${Date.now()}`,
        name: params.name,
        email: params.email,
        gsmNumber: params.gsm_number,
        address: params.address,
        iban: params.iban,
        subMerchantType: params.sub_merchant_type,
        taxOffice: params.tax_office,
        legalCompanyTitle: params.legal_company_title,
        identityNumber: params.identity_number,
        subMerchantExternalId: params.external_id,
    };
    const result = await client.request("POST", "/onboarding/submerchant", body);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
// Tool 8: create_threeds_payment
server.tool("create_threeds_payment", "Initialize a 3D Secure payment", {
    price: z.string().describe("Payment amount"),
    paid_price: z.string().describe("Paid price"),
    currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY").describe("Currency"),
    installment: z.number().int().default(1).describe("Installment count"),
    callback_url: z.string().url().describe("3DS callback URL"),
    payment_card: z.object({
        card_holder_name: z.string().describe("Name on card"),
        card_number: z.string().describe("Card number"),
        expire_month: z.string().describe("Expiry month"),
        expire_year: z.string().describe("Expiry year"),
        cvc: z.string().describe("CVC"),
    }).describe("Card details"),
    buyer_id: z.string().describe("Buyer ID"),
    buyer_name: z.string().describe("First name"),
    buyer_surname: z.string().describe("Last name"),
    buyer_email: z.string().describe("Email"),
    buyer_ip: z.string().default("127.0.0.1").describe("IP address"),
}, async (params) => {
    const client = getClient();
    const body = {
        locale: "tr",
        price: params.price,
        paidPrice: params.paid_price,
        currency: params.currency,
        installment: params.installment,
        callbackUrl: params.callback_url,
        paymentCard: {
            cardHolderName: params.payment_card.card_holder_name,
            cardNumber: params.payment_card.card_number,
            expireMonth: params.payment_card.expire_month,
            expireYear: params.payment_card.expire_year,
            cvc: params.payment_card.cvc,
        },
        buyer: { id: params.buyer_id, name: params.buyer_name, surname: params.buyer_surname, email: params.buyer_email, ip: params.buyer_ip, registrationAddress: "N/A", city: "Istanbul", country: "Turkey", identityNumber: "00000000000" },
        basketItems: [{ id: "BI101", name: "Product", category1: "Default", itemType: "PHYSICAL", price: params.price }],
        shippingAddress: { contactName: `${params.buyer_name} ${params.buyer_surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
        billingAddress: { contactName: `${params.buyer_name} ${params.buyer_surname}`, city: "Istanbul", country: "Turkey", address: "N/A" },
    };
    const result = await client.request("POST", "/payment/3dsecure/initialize", body);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[iyzico-mcp] Server started. 8 tools available.");
}
main().catch((error) => { console.error("[iyzico-mcp] Error:", error); process.exit(1); });
//# sourceMappingURL=index.js.map