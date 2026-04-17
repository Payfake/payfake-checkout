import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/simulate/3ds/$reference")({
  component: ThreeDSPage,
});

function ThreeDSPage() {
  const { reference } = Route.useParams();

  const handleResponse = (success: boolean) => {
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "3DS_COMPLETE",
          payload: {
            success,
            reference,
          },
        },
        "*",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.1,
            }}
            className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Shield className="w-8 h-8 text-blue-600" />
          </motion.div>

          <h2 className="text-xl font-medium text-black mb-2">
            3D Secure Verification
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            This is a simulated 3D Secure page for testing.
          </p>

          <div className="text-xs text-gray-400 mb-6 font-mono">
            Reference: {reference}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium hover:bg-green-100 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Success
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleResponse(false)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium hover:bg-red-100 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Fail
            </motion.button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Click Success to simulate a verified transaction
          </p>
        </div>
      </motion.div>
    </div>
  );
}
