import { api } from "#/utils/axios";

export interface CheckoutData {
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
  charge?: {
    flow_status: string;
    status: string;
    error_code: string | null;
    channel: string;
  };
}

export interface ChargeRequest {
  access_code: string;
  email: string;
  card?: {
    number: string;
    cvv: string;
    expiry_month: string;
    expiry_year: string;
  };
  mobile_money?: {
    phone: string;
    provider: string;
  };
  bank?: {
    code: string;
    account_number: string;
  };
}

export interface FlowResponse {
  status: boolean;
  message: string;
  data: {
    status:
      | "send_pin"
      | "send_otp"
      | "send_birthday"
      | "send_address"
      | "open_url"
      | "pay_offline"
      | "success"
      | "failed";
    reference: string;
    display_text: string;
    amount: number;
    currency: string;
    transaction_date: string;
    domain: string;
    metadata: Record<string, any>;
    gateway_response: string;
    channel: string;
    fees: number;
    url?: string;
    authorization?: {
      authorization_code: string;
      channel: string;
      reusable: boolean;
      country_code: string;
    };
  };
}

export interface SubmitPinRequest {
  access_code: string;
  reference: string;
  pin: string;
}

export interface SubmitOtpRequest {
  access_code: string;
  reference: string;
  otp: string;
}

export interface SubmitBirthdayRequest {
  access_code: string;
  reference: string;
  birthday: string;
}

export interface SubmitAddressRequest {
  access_code: string;
  reference: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface ResendOtpRequest {
  access_code: string;
  reference: string;
}

export interface VerifyResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  charge?: {
    flow_status: string;
    status: string;
    error_code: string | null;
    channel: string;
  };
}

export const checkoutApi = {
  getTransaction: async (
    accessCode: string,
  ): Promise<{ data: CheckoutData; message: string }> => {
    const response = await api.get(`/public/transaction/${accessCode}`);
    return response.data;
  },

  initiateCharge: async (data: ChargeRequest): Promise<FlowResponse> => {
    const response = await api.post("/public/charge", data);
    return response.data;
  },

  submitPin: async (data: SubmitPinRequest): Promise<FlowResponse> => {
    const response = await api.post("/public/charge/submit_pin", data);
    return response.data;
  },

  submitOtp: async (data: SubmitOtpRequest): Promise<FlowResponse> => {
    const response = await api.post("/public/charge/submit_otp", data);
    return response.data;
  },

  submitBirthday: async (
    data: SubmitBirthdayRequest,
  ): Promise<FlowResponse> => {
    const response = await api.post("/public/charge/submit_birthday", data);
    return response.data;
  },

  submitAddress: async (data: SubmitAddressRequest): Promise<FlowResponse> => {
    const response = await api.post("/public/charge/submit_address", data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<FlowResponse> => {
    const response = await api.post("/public/charge/resend_otp", data);
    return response.data;
  },

  simulate3DS: async (
    reference: string,
    accessCode: string,
  ): Promise<FlowResponse> => {
    const response = await api.post(`/public/simulate/3ds/${reference}`, {
      access_code: accessCode,
    });
    return response.data;
  },

  verifyTransaction: async (
    reference: string,
    accessCode: string,
  ): Promise<VerifyResponse> => {
    const response = await api.get(`/public/transaction/verify/${reference}`, {
      params: { access_code: accessCode },
    });
    return response.data.data;
  },
};
