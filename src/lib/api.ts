import { api } from "#/utils/axios";

export interface CheckoutData {
  message: string;
  data: {
    access_code: string;
    amount: number;
    currency: string;
    status: string;
    reference: string;
    callback_url: string;
    merchant: {
      business_name: string;
      public_key: string;
    };
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface PaymentResult {
  status: string;
  message: string;
  data: {
    transaction: {
      reference: string;
      status: string;
      amount: number;
    };
  };
}

export const checkoutApi = {
  getTransaction: async (accessCode: string): Promise<CheckoutData> => {
    const response = await api.get(`/public/transaction/${accessCode}`);
    return response.data;
  },

  chargeCard: async (data: {
    access_code: string;
    card_number: string;
    card_expiry: string;
    cvv: string;
    email: string;
  }): Promise<PaymentResult> => {
    const response = await api.post("/public/charge/card", data);
    return response.data;
  },

  chargeMomo: async (data: {
    access_code: string;
    phone: string;
    provider: string;
    email: string;
  }): Promise<PaymentResult> => {
    const response = await api.post("/public/charge/mobile_money", data);
    return response.data;
  },
};
