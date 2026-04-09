import { api } from "#/utils/axios";

export interface CheckoutData {
  access_code: string;
  amount: number;
  currency: string;
  email: string;
  merchant_name: string;
  status: string;
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
  getTransaction: async (
    access_code: string,
  ): Promise<{ data: CheckoutData }> => {
    const response = await api.get(`/public/transaction/${access_code}`);
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
