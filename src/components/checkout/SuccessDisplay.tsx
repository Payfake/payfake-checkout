import { motion } from "framer-motion";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface SuccessDisplayProps {
  amount: number;
  currency: string;
  reference: string;
}

export function SuccessDisplay({
  amount,
  currency,
  reference,
}: SuccessDisplayProps) {
  const [copied, setCopied] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
            >
              <CheckCircle className="w-20 h-20 text-green-600" />
            </motion.div>

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 30 : -30) * (i + 1) * 0.3],
                  y: [0, -40 - i * 5],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.6 + i * 0.05,
                  ease: "easeOut",
                }}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"
              />
            ))}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-light tracking-tight text-black text-center mb-2"
          >
            Payment Successful
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-4xl font-light tracking-tight text-black text-center mb-6"
          >
            {formatAmount(amount, currency)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-t border-gray-100 pt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reference</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-black">
                  {reference}
                </code>
                <button
                  onClick={copyReference}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {copied ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-green-600"
                    >
                      Copied!
                    </motion.span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => window.close()}
            className="w-full mt-6 py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            Close Window
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
