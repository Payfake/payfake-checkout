"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Lock } from "lucide-react";
import { CardForm } from "./CardForm";
import { MomoForm } from "./MomoForm";
import { PinForm } from "./PinForm";
import { OtpForm } from "./OtpForm";
import { BirthdayForm } from "./BirthdayForm";
import { AddressForm } from "./AddressForm";
import { PayOfflineDisplay } from "./PayOfflineDisplay";
import { ThreeDSFrame } from "./ThreeDSFrame";
import { SuccessDisplay } from "./SuccessDisplay";
import { checkoutApi } from "../../lib/api";
import type { ChargeFlowStatus, ChargeResponse } from "#/lib/flow-types";

type PaymentMethod = "card" | "momo";
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

export function CheckoutPage({ transaction }: CheckoutPageProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [state, setState] = useState<CheckoutState>("method_selection");
  const [error, setError] = useState<string | null>(null);
  const [flowStatus, setFlowStatus] = useState<ChargeFlowStatus | null>(null);
  const [chargeData, setChargeData] = useState<ChargeResponse | null>(null);
  const [result, setResult] = useState<any>(null);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const handleCardSubmit = async (cardData: any) => {
    setState("processing");
    setError(null);

    try {
      const response = await checkoutApi.chargeCard({
        access_code: transaction.access_code,
        card_number: cardData.number.replace(/\s/g, ""),
        card_expiry: cardData.expiry,
        cvv: cardData.cvv,
        email: transaction.email,
      });

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
      const response = await checkoutApi.chargeMomo({
        access_code: transaction.access_code,
        phone: momoData.phone,
        provider: momoData.provider,
        email: transaction.email,
      });

      handleChargeResponse(response);
    } catch (err: any) {
      setState("error");
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  const handleChargeResponse = (response: ChargeResponse) => {
    const flow = response.data.charge.flow_status;
    const displayText = response.data.display_text;

    if (flow === "success") {
      setResult(response);
      setState("success");
      return;
    }

    if (flow === "failed") {
      setState("error");
      setError(displayText || "Payment failed");
      return;
    }

    setChargeData(response);
    setFlowStatus(flow);
    setState("flow");
  };

  const handleFlowSubmit = async (endpoint: string, data: any) => {
    setState("processing");
    setError(null);

    try {
      if (!chargeData) return;

      const response = await checkoutApi.submitFlow(endpoint, {
        reference: chargeData.data.reference,
        ...data,
      });

      handleChargeResponse(response);
    } catch (err: any) {
      setState("flow");
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleThreeDSComplete = (response: ChargeResponse) => {
    handleChargeResponse(response);
  };

  const getEndpointForFlow = (flow: ChargeFlowStatus): string => {
    switch (flow) {
      case "send_pin":
        return "/submit_pin";
      case "send_otp":
        return "/submit_otp";
      case "send_birthday":
        return "/submit_birthday";
      case "send_address":
        return "/submit_address";
      default:
        return "";
    }
  };

  const renderFlowStep = () => {
    if (!flowStatus || !chargeData) return null;

    const commonProps = {
      onSubmit: (data: any) =>
        handleFlowSubmit(getEndpointForFlow(flowStatus), data),
      isProcessing: state === "processing",
      displayText: chargeData.data.display_text,
      phone: chargeData.data.charge.momo_phone,
    };

    switch (flowStatus) {
      case "send_pin":
        return <PinForm {...commonProps} />;
      case "send_otp":
        return <OtpForm {...commonProps} />;
      case "send_birthday":
        return <BirthdayForm {...commonProps} />;
      case "send_address":
        return <AddressForm {...commonProps} />;
      case "open_url":
        return (
          <ThreeDSFrame
            url={chargeData.data.three_ds_url!}
            reference={chargeData.data.reference}
            onComplete={handleThreeDSComplete}
          />
        );
      case "pay_offline":
        return (
          <PayOfflineDisplay
            displayText={chargeData.data.display_text}
            reference={chargeData.data.reference}
            onPoll={(status) => {
              if (status === "success") {
                const successResponse = {
                  data: {
                    transaction: {
                      reference: chargeData.data.reference,
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
            }}
          />
        );
      default:
        return null;
    }
  };

  // Success state
  if (state === "success" && result) {
    return (
      <SuccessDisplay
        amount={transaction.amount}
        currency={transaction.currency}
        reference={result.data?.transaction?.reference || transaction.reference}
        callbackUrl={transaction.callback_url}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-110"
      >
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-15 h-15 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Payfake"
                className="w-15 h-15 object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-600 tracking-wide">
              PAYFAKE
            </span>
          </div>

          <h1 className="text-2xl font-medium text-black mb-2">
            {transaction.merchant_name}
          </h1>
          <p className="text-4xl font-light text-black mb-1 tracking-tight">
            {formatAmount(transaction.amount, transaction.currency)}
          </p>
          {transaction.customer_name && (
            <p className="text-sm text-gray-600 mb-0.5">
              {transaction.customer_name}
            </p>
          )}
          <p className="text-sm text-gray-500">{transaction.email}</p>
        </div>

        {state === "method_selection" && (
          <>
            <div className="flex gap-2 mb-8">
              <motion.button
                whileHover={{ borderColor: "#000000" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                  method === "card"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </motion.button>
              <motion.button
                whileHover={{ borderColor: "#000000" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMethod("momo")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                  method === "momo"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile Money
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {method === "card" ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardForm
                    onSubmit={handleCardSubmit}
                    isProcessing={state === "processing"}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="momo"
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <MomoForm
                    onSubmit={handleMomoSubmit}
                    isProcessing={state === "processing"}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {state === "flow" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={flowStatus}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderFlowStep()}
            </motion.div>
          </AnimatePresence>
        )}

        {state === "processing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mx-auto mb-4" />
            <p className="text-sm text-gray-500">Processing...</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4"
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setState("method_selection");
                  setError(null);
                  setChargeData(null);
                  setFlowStatus(null);
                }}
                className="mt-2 text-sm text-black hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Powered by Payfake</span>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>Secured by SSL</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
