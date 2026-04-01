export interface IyzicoPayment {
    status: string;
    paymentId: string;
    price: string;
    paidPrice: string;
    currency: string;
    installment: number;
    basketId?: string;
    paymentItems?: IyzicoPaymentItem[];
}
export interface IyzicoPaymentItem {
    itemId: string;
    paymentTransactionId: string;
    price: string;
    paidPrice: string;
}
export interface IyzicoCheckoutForm {
    status: string;
    token: string;
    checkoutFormContent: string;
    paymentPageUrl: string;
}
export interface IyzicoSubMerchant {
    status: string;
    subMerchantKey: string;
    subMerchantType: string;
}
export interface IyzicoRefund {
    status: string;
    paymentId: string;
    paymentTransactionId: string;
    price: string;
}
export interface IyzicoApiResponse {
    [key: string]: unknown;
}
