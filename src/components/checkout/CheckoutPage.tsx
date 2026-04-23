import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Building,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { CardForm } from "./CardForm";
import { MomoForm } from "./MomoForm";
import { BankForm } from "./BankForm";
import { PinForm } from "./PinForm";
import { OtpForm } from "./OtpForm";
import { BirthdayForm } from "./BirthdayForm";
import { AddressForm } from "./AddressForm";
import { PayOfflineDisplay } from "./PayOfflineDisplay";
import { ThreeDSFrame } from "./ThreeDSFrame";
import { SuccessDisplay } from "./SuccessDisplay";
import {
  checkoutApi,
  type ChargeRequest,
  type FlowResponse,
} from "../../lib/api";

type PaymentMethod = "card" | "momo" | "bank";
type CheckoutState =
  | "method_selection"
  | "processing"
  | "flow"
  | "success"
  | "error";

interface CheckoutPageProps {
  transaction: {
    access_code: string;
    amount: number;
    currency: string;
    email: string;
    merchant_name: string;
    status: string;
    customer_name?: string;
    callback_url?: string;
    reference: string;
  };
}

const methods = [
  { id: "card" as const, label: "Card", icon: CreditCard },
  { id: "bank" as const, label: "Bank", icon: Building },
  { id: "momo" as const, label: "Mobile Money", icon: Smartphone },
];

export function CheckoutPage({ transaction }: CheckoutPageProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [state, setState] = useState<CheckoutState>("method_selection");
  const [error, setError] = useState<string | null>(null);
  const [flowResponse, setFlowResponse] = useState<FlowResponse | null>(null);
  const [result, setResult] = useState<any>(null);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const getMethodLabel = (m: PaymentMethod) => {
    if (m === "card") return "card";
    if (m === "bank") return "bank";
    return "mobile money";
  };

  const handleChargeResponse = (response: FlowResponse) => {
    const data = response.data;
    const flowStatus = data.status;

    if (flowStatus === "success") {
      setResult(data);
      setState("success");
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "PAYFAKE_SUCCESS", payload: data },
          "*",
        );
      }
      return;
    }

    if (flowStatus === "failed") {
      setState("error");
      setError(data.display_text || "Payment failed");
      return;
    }

    setFlowResponse(data);
    setState("flow");
  };

  const handleCardSubmit = async (cardData: any) => {
    setState("processing");
    setError(null);
    try {
      const request: ChargeRequest = {
        access_code: transaction.access_code,
        email: transaction.email,
        card: cardData,
      };
      const response = await checkoutApi.initiateCharge(request);
      handleChargeResponse(response);
    } catch (err: any) {
      setState("error");
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  const handleMomoSubmit = async (momoData: any) => {
    setState("processing");
    setError(null);
    try {
      const request: ChargeRequest = {
        access_code: transaction.access_code,
        email: transaction.email,
        mobile_money: momoData,
      };
      const response = await checkoutApi.initiateCharge(request);
      handleChargeResponse(response);
    } catch (err: any) {
      setState("error");
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  const handleBankSubmit = async (bankData: any) => {
    setState("processing");
    setError(null);
    try {
      const request: ChargeRequest = {
        access_code: transaction.access_code,
        email: transaction.email,
        bank: bankData,
      };
      const response = await checkoutApi.initiateCharge(request);
      handleChargeResponse(response);
    } catch (err: any) {
      setState("error");
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  const handlePinSubmit = async (data: { pin: string }) => {
    if (!flowResponse) return;
    setState("processing");
    try {
      const response = await checkoutApi.submitPin({
        access_code: transaction.access_code,
        reference: flowResponse.reference,
        pin: data.pin,
      });
      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "PIN verification failed");
    }
  };

  const handleOtpSubmit = async (data: { otp: string }) => {
    if (!flowResponse) return;
    setState("processing");
    try {
      const response = await checkoutApi.submitOtp({
        access_code: transaction.access_code,
        reference: flowResponse.reference,
        otp: data.otp,
      });
      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    if (!flowResponse) return;
    await checkoutApi.resendOtp({
      access_code: transaction.access_code,
      reference: flowResponse.reference,
    });
  };

  const handleBirthdaySubmit = async (data: { birthday: string }) => {
    if (!flowResponse) return;
    setState("processing");
    try {
      const response = await checkoutApi.submitBirthday({
        access_code: transaction.access_code,
        reference: flowResponse.reference,
        birthday: data.birthday,
      });
      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "Birthday verification failed");
    }
  };

  const handleAddressSubmit = async (addressData: any) => {
    if (!flowResponse) return;
    setState("processing");
    try {
      const response = await checkoutApi.submitAddress({
        access_code: transaction.access_code,
        reference: flowResponse.reference,
        ...addressData,
      });
      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "Address verification failed");
    }
  };

  const handleThreeDSComplete = async () => {
    if (!flowResponse) return;
    setState("processing");
    try {
      const response = await checkoutApi.simulate3DS(
        flowResponse.reference,
        transaction.access_code,
      );
      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "3DS verification failed");
    }
  };

  const handlePayOfflinePoll = async (status: string) => {
    if (!flowResponse) return;
    if (status === "success") {
      const successResponse = {
        data: {
          transaction: {
            reference: flowResponse.reference,
            status: "success",
            amount: transaction.amount,
          },
        },
      };
      setResult(successResponse);
      setState("success");
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "PAYFAKE_SUCCESS", payload: successResponse },
          "*",
        );
      }
    } else if (status === "failed") {
      setState("error");
      setError("Payment was not completed");
    }
  };

  const renderFlowStep = () => {
    if (!flowResponse) return null;
    const { status, display_text } = flowResponse;

    switch (status) {
      case "send_pin":
        return (
          <PinForm
            onSubmit={handlePinSubmit}
            isProcessing={state === "processing"}
            displayText={display_text}
          />
        );
      case "send_otp":
        return (
          <OtpForm
            onSubmit={handleOtpSubmit}
            onResend={handleResendOtp}
            isProcessing={state === "processing"}
            displayText={display_text}
          />
        );
      case "send_birthday":
        return (
          <BirthdayForm
            onSubmit={handleBirthdaySubmit}
            isProcessing={state === "processing"}
            displayText={display_text}
          />
        );
      case "send_address":
        return (
          <AddressForm
            onSubmit={handleAddressSubmit}
            isProcessing={state === "processing"}
            displayText={display_text}
          />
        );
      case "open_url":
        return (
          <ThreeDSFrame
            url={flowResponse.url!}
            reference={flowResponse.reference}
            onComplete={handleThreeDSComplete}
          />
        );
      case "pay_offline":
        return (
          <PayOfflineDisplay
            displayText={display_text}
            reference={flowResponse.reference}
            accessCode={transaction.access_code}
            onPoll={handlePayOfflinePoll}
          />
        );
      default:
        return null;
    }
  };

  if (state === "success" && result) {
    return (
      <SuccessDisplay
        amount={transaction.amount}
        currency={transaction.currency}
        reference={
          result.data?.transaction?.reference ||
          flowResponse?.reference ||
          transaction.reference
        }
        callbackUrl={transaction.callback_url}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.jpeg" alt="Payfake" className="h-7 w-auto" />
            <span className="text-xs font-medium text-gray-400 tracking-wide">
              CHECKOUT
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {transaction.merchant_name}
              </h2>
              {transaction.customer_name && (
                <p className="text-sm text-gray-500">
                  {transaction.customer_name}
                </p>
              )}
              <p className="text-sm text-gray-500">{transaction.email}</p>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          </div>
        </div>

        <div className="flex">
          <div className="w-56 bg-gray-50 border-r border-gray-200 py-4 px-3 hidden sm:block">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
              Pay with
            </p>
            <div className="space-y-1">
              {methods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (state === "method_selection" || state === "error") {
                      setMethod(item.id);
                      if (state === "error") setError(null);
                    }
                  }}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-sm transition-colors cursor-pointer overflow-hidden ${
                    method === item.id &&
                    (state === "method_selection" || state === "processing")
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {method === item.id &&
                    (state === "method_selection" ||
                      state === "processing") && (
                      <motion.div
                        layoutId="desktopActiveBg"
                        className="absolute inset-0 bg-[#0A2540] rounded-md"
                        transition={{
                          type: "spring",
                          bounce: 0.3,
                          duration: 0.7,
                        }}
                      />
                    )}
                  <motion.div
                    animate={
                      method === item.id
                        ? {
                            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="sm:hidden flex gap-2 mb-6">
              {methods.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMethod(item.id)}
                  className={`relative flex-1 flex flex-col items-center gap-2 py-3 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer overflow-hidden ${
                    method === item.id
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-700"
                  }`}
                >
                  {method === item.id && (
                    <motion.div
                      layoutId="mobileActiveBg"
                      className="absolute inset-0 bg-[#0A2540] rounded-md"
                      transition={{
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.7,
                      }}
                    />
                  )}
                  <motion.div
                    animate={
                      method === item.id
                        ? {
                            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </div>

            {state === "method_selection" && !error && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={method}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-5">
                    Enter your {getMethodLabel(method)} details
                  </h3>

                  {method === "card" && (
                    <CardForm
                      onSubmit={handleCardSubmit}
                      isProcessing={false}
                    />
                  )}
                  {method === "bank" && (
                    <BankForm
                      onSubmit={handleBankSubmit}
                      isProcessing={false}
                    />
                  )}
                  {method === "momo" && (
                    <MomoForm
                      onSubmit={handleMomoSubmit}
                      isProcessing={false}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {state === "flow" && !error && (
              <div>
                <button
                  onClick={() => {
                    setState("method_selection");
                    setFlowResponse(null);
                  }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flowResponse?.status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderFlowStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {state === "processing" && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-[#0A2540]" />
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => {
                      setState("method_selection");
                      setError(null);
                      setFlowResponse(null);
                    }}
                    className="mt-2 text-sm font-medium text-gray-900 hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs text-gray-500">
            Secured by{" "}
            <span className="font-medium text-gray-700">Payfake</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
