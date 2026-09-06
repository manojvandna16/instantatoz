declare module 'react-native-razorpay' {
  export interface CheckoutOptions {
    description: string;
    image?: string;
    currency: string;
    key: string;
    amount: number | string;
    name: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  export interface CheckoutResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  export default class RazorpayCheckout {
    static open(options: CheckoutOptions): Promise<CheckoutResponse>;
  }
}
