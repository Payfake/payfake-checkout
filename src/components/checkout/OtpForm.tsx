import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

interface OtpFormProps {
  onSubmit: (data: { otp: string }) => void;
  onResend: () => Promise<void>;
  isProcessing: boolean;
  displayText: string;
  phone?: string;
}

export function OtpForm({
  onSubmit,
  onResend,
  isProcessing,
  displayText,
  phone,
}: OtpFormProps) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (otp.length >= 4) {
      onSubmit({ otp });
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    await onResend();
    setTimer(60);
    setResending(false);
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\+\d{3})(\d{3})(\d{3})/, "$1 *** ***");
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Enter OTP</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
        {phone && (
          <p className="text-xs text-gray-400 mt-1">
            Sent to {formatPhone(phone)}
          </p>
        )}
      </div>

      <div>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="000000"
          autoFocus
          disabled={isProcessing}
        />
      </div>

      <motion.button
        whileHover={
          !isProcessing && otp.length >= 4 ? { backgroundColor: "#1a1a1a" } : {}
        }
        whileTap={!isProcessing && otp.length >= 4 ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={isProcessing || otp.length < 4}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer ${
          isProcessing || otp.length < 4
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {isProcessing ? "Verifying..." : "Verify OTP"}
      </motion.button>

      <p className="text-center text-sm text-gray-400">
        Didn't receive code?{" "}
        {timer > 0 ? (
          <span className="text-gray-400">Resend in {timer}s</span>
        ) : resending ? (
          <span className="text-gray-400">Sending...</span>
        ) : (
          <button
            onClick={handleResend}
            className="text-black hover:underline cursor-pointer"
          >
            Resend OTP
          </button>
        )}
      </p>
    </div>
  );
}
