export type ChargeFlowStatus =
  | "send_pin"
  | "send_otp"
  | "send_birthday"
  | "send_address"
  | "open_url"
  | "pay_offline"
  | "success"
  | "failed";

export interface ChargeResponse {
  status: string;
  message: string;
  data: {
    charge: {
      id: string;
      status: string;
      flow_status: ChargeFlowStatus;
      momo_phone?: string;
      momo_provider?: string;
    };
    display_text: string;
    reference: string;
    status: string;
    three_ds_url?: string;
    transaction: any;
  };
  code: string;
}
