import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Lock } from "lucide-react";
import { CardForm } from "./CardForm";
import { MomoForm } from "./MomoForm";
import { SuccessDisplay } from "./SuccessDisplay";
import { checkoutApi } from "../../lib/api";

type PaymentMethod = "card" | "momo";
type PaymentState = "idle" | "processing" | "success" | "error";

interface CheckoutPageProps {
  transaction: {
    access_code: string;
    amount: number;
    currency: string;
    email: string;
    merchant_name: string;
    status: string;
  };
}

export function CheckoutPage({ transaction }: CheckoutPageProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [state, setState] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
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

      setResult(response);
      setState("success");

      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "PAYFAKE_SUCCESS", payload: response },
          "*",
        );
      }
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

      setResult(response);
      setState("success");

      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "PAYFAKE_SUCCESS", payload: response },
          "*",
        );
      }
    } catch (err: any) {
      setState("error");
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  if (state === "success" && result) {
    return (
      <SuccessDisplay
        amount={transaction.amount}
        currency={transaction.currency}
        reference={result.data.transaction.reference}
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
            <div className="w-15 h-15  rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.JPG"
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
          <p className="text-sm text-gray-500">{transaction.email}</p>
        </div>

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

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {method === "card" ? (
            <motion.div
              key="card"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
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
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <MomoForm
                onSubmit={handleMomoSubmit}
                isProcessing={state === "processing"}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
