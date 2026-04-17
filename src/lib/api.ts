import { api } from "#/utils/axios";
import type { ChargeResponse } from "./flow-types";

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
  getTransaction: async (
    accessCode: string,
  ): Promise<{ data: CheckoutData }> => {
    const response = await api.get(`/public/transaction/${accessCode}`);
    return response.data;
  },

  chargeCard: async (data: {
    access_code: string;
    card_number: string;
    card_expiry: string;
    cvv: string;
    email: string;
  }): Promise<ChargeResponse> => {
    const response = await api.post("/public/charge/card", data);
    return response.data;
  },

  chargeMomo: async (data: {
    access_code: string;
    phone: string;
    provider: string;
    email: string;
  }): Promise<ChargeResponse> => {
    const response = await api.post("/public/charge/mobile_money", data);
    return response.data;
  },

  submitFlow: async (endpoint: string, data: any): Promise<ChargeResponse> => {
    const response = await api.post(`/public/charge${endpoint}`, data);
    return response.data;
  },

  resendOtp: async (reference: string): Promise<ChargeResponse> => {
    const response = await api.post("/public/charge/resend_otp", { reference });
    return response.data;
  },

  simulate3DS: async (
    reference: string,
    data: any,
  ): Promise<ChargeResponse> => {
    const response = await api.post(`/public/simulate/3ds/${reference}`, data);
    return response.data;
  },

  verifyTransaction: async (
    reference: string,
  ): Promise<{ data: { status: string } }> => {
    const response = await api.get(`/public/transaction/verify/${reference}`);
    return response.data;
  },
};
