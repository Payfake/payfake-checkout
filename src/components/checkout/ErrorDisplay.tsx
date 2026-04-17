import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
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
            <div className="w-10 h-10 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.jpeg"
                alt="Payfake"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-600 tracking-wide">
              PAYFAKE
            </span>
          </div>
        </div>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <XCircle className="w-7 h-7 text-red-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-medium text-black mb-2"
          >
            Payment Failed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mb-8"
          >
            {message}
          </motion.p>

          {onRetry && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-900 transition-colors cursor-pointer"
            >
              Try Again
            </motion.button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center justify-center text-xs text-gray-400">
            <span>Powered by Payfake</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
