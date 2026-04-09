import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  ChevronDown,
  Check,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface MomoFormProps {
  onSubmit: (data: any) => void;
  isProcessing: boolean;
}

const providers = [
  {
    id: "mtn",
    name: "MTN",
    prefix: ["024", "054", "055", "059"],
    color: "#FFC403",
  },
  { id: "vodafone", name: "Telecel", prefix: ["020", "050"], color: "#E60000" },
  {
    id: "airteltigo",
    name: "AT",
    prefix: ["026", "056", "057"],
    color: "#0078D7",
  },
];

export function MomoForm({ onSubmit, isProcessing }: MomoFormProps) {
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState(providers[0].id);
  const [focused, setFocused] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [detectedProvider, setDetectedProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validatePhone = (
    value: string,
  ): { isValid: boolean; error: string | null } => {
    // Remove all spaces
    const clean = value.replace(/\s+/g, "");

    // Empty is invalid
    if (!clean) {
      return { isValid: false, error: null };
    }

    // Check if it starts with 233 (international without +)
    if (clean.startsWith("233")) {
      // Must be exactly 12 digits (233 + 9 digits)
      if (clean.length !== 12) {
        return {
          isValid: false,
          error: clean.length > 12 ? "Number too long" : "Number too short",
        };
      }
    } else if (clean.startsWith("0")) {
      // Local format: must start with 0 and be exactly 10 digits
      if (clean.length !== 10) {
        return {
          isValid: false,
          error: clean.length > 10 ? "Number too long" : "Number too short",
        };
      }
    } else if (clean.startsWith("+233")) {
      // With + sign: must be exactly 13 characters
      if (clean.length !== 13) {
        return {
          isValid: false,
          error: clean.length > 13 ? "Number too long" : "Number too short",
        };
      }
    } else {
      return {
        isValid: false,
        error: "Must start with 0, 233, or +233",
      };
    }

    // Check if it's only digits (after removing + if present)
    const digitsOnly = clean.replace(/^\+/, "");
    if (!/^\d+$/.test(digitsOnly)) {
      return { isValid: false, error: "Only numbers allowed" };
    }

    return { isValid: true, error: null };
  };

  const formatPhone = (value: string): string => {
    const clean = value.replace(/\s+/g, "");

    // Don't format if it starts with + or 233
    if (clean.startsWith("+") || clean.startsWith("233")) {
      return clean;
    }

    // Format local number: 024 412 3456
    if (clean.startsWith("0") && clean.length >= 3) {
      return (
        clean.slice(0, 3) + " " + clean.slice(3, 6) + " " + clean.slice(6, 10)
      );
    }

    return clean;
  };

  const handlePhoneChange = (value: string) => {
    const raw = value.replace(/\s+/g, "");

    // Enforce length limits
    if (raw.startsWith("+233")) {
      if (raw.length > 13) return;
    } else if (raw.startsWith("233")) {
      if (raw.length > 12) return;
    } else if (raw.startsWith("0")) {
      if (raw.length > 10) return;
    }

    const formatted = formatPhone(raw);
    setPhone(formatted);

    // Validate
    const validation = validatePhone(raw);
    setIsValid(validation.isValid);
    setError(validation.error);
  };

  // Auto-detect provider based on phone prefix
  useEffect(() => {
    const clean = phone.replace(/\s+/g, "");

    // Get the local prefix (first 3 digits of local number)
    let prefix: string;
    if (clean.startsWith("+233")) {
      prefix = "0" + clean.substring(4, 6);
    } else if (clean.startsWith("233")) {
      prefix = "0" + clean.substring(3, 5);
    } else if (clean.startsWith("0")) {
      prefix = clean.substring(0, 3);
    } else {
      return;
    }

    if (prefix.length === 3) {
      const matched = providers.find((p) => p.prefix.includes(prefix));

      if (matched && matched.id !== provider) {
        setDetectedProvider(matched.id);
        setProvider(matched.id);

        setTimeout(() => setDetectedProvider(null), 1500);
      }
    }
  }, [phone]);

  const handleSubmit = () => {
    const clean = phone.replace(/\s+/g, "");
    const validation = validatePhone(clean);

    if (!validation.isValid) {
      setError(validation.error || "Invalid phone number");
      return;
    }

    // Format to standard +233 format for API
    let formattedPhone = clean;
    if (clean.startsWith("0")) {
      formattedPhone = "+233" + clean.substring(1);
    } else if (clean.startsWith("233")) {
      formattedPhone = "+" + clean;
    }

    onSubmit({ phone: formattedPhone, provider });
  };

  const selectedProvider = providers.find((p) => p.id === provider);

  const getPlaceholder = () => {
    return "024 412 3456";
  };

  const getHint = () => {
    return "024 XXX XXXX, 233XXXXXXXXX, or +233XXXXXXXXX";
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone number
        </label>
        <div
          className={`relative flex items-center border rounded-lg transition-all duration-200 bg-white ${
            focused === "phone"
              ? "border-black ring-1 ring-black"
              : error && phone
                ? "border-red-300"
                : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Phone className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            ref={inputRef}
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            placeholder={getPlaceholder()}
            className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-black placeholder:text-gray-400 text-base"
            disabled={isProcessing}
          />

          <AnimatePresence>
            {detectedProvider && !error && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-3 flex items-center gap-1.5"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: providers.find(
                      (p) => p.id === detectedProvider,
                    )?.color,
                  }}
                />
                <span className="text-xs text-gray-500">
                  {providers.find((p) => p.id === detectedProvider)?.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && phone && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 flex items-center gap-1.5 text-red-500"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!error && !phone && (
          <p className="mt-1.5 text-xs text-gray-400">{getHint()}</p>
        )}

        <AnimatePresence>
          {isValid && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-green-600"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-xs">Valid number</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Network
        </label>

        <motion.button
          whileHover={{ borderColor: "#d1d5db" }}
          type="button"
          onClick={() => !isProcessing && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white transition-all duration-200 ${
            isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${isOpen ? "border-black ring-1 ring-black" : "border-gray-200"}`}
          disabled={isProcessing}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: selectedProvider?.color }}
            />
            <span className="text-black font-medium">
              {selectedProvider?.name}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
              >
                {providers.map((p, index) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: "#fafafa" }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => {
                      setProvider(p.id);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3.5 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-black font-medium">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        {p.prefix.join(", ")}
                      </span>
                    </div>

                    {provider === p.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <Check className="w-4 h-4 text-black" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={
          !isProcessing && isValid ? { backgroundColor: "#1a1a1a" } : {}
        }
        whileTap={!isProcessing && isValid ? { scale: 0.98 } : {}}
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || !isValid}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 ${
          isProcessing
            ? "bg-gray-400 text-white cursor-not-allowed"
            : !isValid
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900 cursor-pointer"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Pay now"
        )}
      </motion.button>
    </div>
  );
}
