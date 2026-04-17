import { motion } from "framer-motion";
import { Check, CheckCircle, Copy } from "lucide-react";
import { useState, useEffect } from "react";

interface SuccessDisplayProps {
  amount: number;
  currency: string;
  reference: string;
  callbackUrl?: string;
  message?: string;
}

export function SuccessDisplay({
  amount,
  currency,
  reference,
  callbackUrl,
  message,
}: SuccessDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const copyReference = () => {
    navigator.clipboard?.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!callbackUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const separator = callbackUrl.includes("?") ? "&" : "?";
          window.location.href = `${callbackUrl}${separator}reference=${reference}&trxref=${reference}&status=success`;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callbackUrl, reference]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-110"
      >
        <div className="mb-10">
          <div className="flex items-center gap-3">
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
        </div>

        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.1,
            }}
            className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-8 h-8 text-green-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-medium text-black mb-2"
          >
            Payment Successful
          </motion.h1>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-sm text-gray-500 mb-4"
            >
              {message}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-light text-black mb-8 tracking-tight"
          >
            {formatAmount(amount, currency)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <p className="text-xs text-gray-500 mb-1.5">
              Transaction Reference
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-lg font-mono text-black">{reference}</code>
              <button
                onClick={copyReference}
                className="p-1.5 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              >
                {copied ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </motion.span>
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </motion.div>

          {callbackUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              Redirecting in{" "}
              <span className="font-medium text-black">{countdown}</span> second
              {countdown !== 1 ? "s" : ""}...
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center justify-center text-xs text-gray-400">
            <span>Powered by Payfake</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
