import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface PinFormProps {
  onSubmit: (data: { pin: string }) => void;
  isProcessing: boolean;
  displayText: string;
}

export function PinForm({ onSubmit, isProcessing, displayText }: PinFormProps) {
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onSubmit({ pin });
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Enter PIN</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
      </div>

      <div>
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="••••••"
          autoFocus
        />
      </div>

      <motion.button
        whileHover={{ backgroundColor: "#1a1a1a" }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isProcessing || pin.length < 4}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer ${
          isProcessing || pin.length < 4
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {isProcessing ? "Verifying..." : "Confirm PIN"}
      </motion.button>
    </div>
  );
}
