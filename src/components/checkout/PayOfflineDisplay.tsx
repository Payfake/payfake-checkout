import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Clock, CheckCircle, XCircle } from "lucide-react";
import { checkoutApi } from "../../lib/api";

interface PayOfflineDisplayProps {
  displayText: string;
  reference: string;
  accessCode: string;
  onPoll: (status: string) => void;
}

export function PayOfflineDisplay({
  displayText,
  reference,
  accessCode,
  onPoll,
}: PayOfflineDisplayProps) {
  const [polling, setPolling] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!polling) return;

    const poll = async () => {
      try {
        const response = await checkoutApi.verifyTransaction(
          reference,
          accessCode,
        );
        const txStatus = response?.status;
        setStatus(txStatus);

        if (txStatus === "success" || txStatus === "failed") {
          setPolling(false);
          onPoll(txStatus);
        }
      } catch (error) {
        console.error("Polling failed:", error);
      }
    };

    // Poll immediately
    poll();

    // Set up interval for polling every 3 seconds
    const interval = setInterval(() => {
      setAttempts((prev) => prev + 1);
      // Trigger shake animation on each poll
      setShake(true);
      setTimeout(() => setShake(false), 500);
      poll();

      // Stop polling after 30 attempts (90 seconds)
      if (attempts >= 30) {
        setPolling(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling, attempts, reference, accessCode, onPoll]);

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-lg font-medium text-black mb-2">
          Payment Confirmed
        </h3>
        <p className="text-sm text-gray-500">Your payment has been received</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-8 h-8 text-red-600" />
        </motion.div>
        <h3 className="text-lg font-medium text-black mb-2">Payment Failed</h3>
        <p className="text-sm text-gray-500">
          The transaction was not completed
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{
          scale: { type: "spring", stiffness: 200, damping: 20 },
          x: { duration: 0.5, ease: "easeInOut" },
        }}
        className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Smartphone className="w-8 h-8 text-yellow-600" />
      </motion.div>
      <h3 className="text-lg font-medium text-black mb-2">
        Payment Prompt Sent
      </h3>
      <p className="text-sm text-gray-500 mb-4">{displayText}</p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Clock className="w-4 h-4" />
        <span>Waiting for confirmation...</span>
      </div>
      <p className="text-xs text-gray-400 mt-6">Reference: {reference}</p>
    </div>
  );
}
