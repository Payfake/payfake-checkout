import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Calendar, Lock, Check, AlertCircle } from "lucide-react";

interface CardFormProps {
  onSubmit: (data: any) => void;
  isProcessing: boolean;
}

interface CardType {
  name: string;
  pattern: RegExp;
  maxLength: number;
  cvvLength: number;
  format: (value: string) => string;
}

const cardTypes: CardType[] = [
  {
    name: "Visa",
    pattern: /^4/,
    maxLength: 16,
    cvvLength: 3,
    format: (v) => v.replace(/(\d{4})/g, "$1 ").trim(),
  },
  {
    name: "Mastercard",
    pattern: /^5[1-5]|^2[2-7]/,
    maxLength: 16,
    cvvLength: 3,
    format: (v) => v.replace(/(\d{4})/g, "$1 ").trim(),
  },
  {
    name: "Amex",
    pattern: /^3[47]/,
    maxLength: 15,
    cvvLength: 4,
    format: (v) => v.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").trim(),
  },
  {
    name: "Discover",
    pattern: /^6(?:011|5)/,
    maxLength: 16,
    cvvLength: 3,
    format: (v) => v.replace(/(\d{4})/g, "$1 ").trim(),
  },
];

export function CardForm({ onSubmit, isProcessing }: CardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const [cardType, setCardType] = useState<CardType | null>(null);
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [cvvError, setCvvError] = useState<string | null>(null);

  const [isCardNumberValid, setIsCardNumberValid] = useState(false);
  const [isExpiryValid, setIsExpiryValid] = useState(false);
  const [isCvvValid, setIsCvvValid] = useState(false);

  // Luhn algorithm for card number validation
  const luhnCheck = (num: string): boolean => {
    const arr = num.split("").reverse();
    let sum = 0;

    for (let i = 0; i < arr.length; i++) {
      let digit = parseInt(arr[i]);

      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
    }

    return sum % 10 === 0;
  };

  // Detect card type
  const detectCardType = (value: string): CardType | null => {
    const clean = value.replace(/\s+/g, "");
    return cardTypes.find((type) => type.pattern.test(clean)) || null;
  };

  // Format card number based on type
  const formatCardNumber = (value: string): string => {
    const clean = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const type = detectCardType(clean) || cardTypes[0];
    return type.format(clean);
  };

  // Validate card number
  const validateCardNumber = (
    value: string,
  ): { isValid: boolean; error: string | null } => {
    const clean = value.replace(/\s+/g, "");

    if (!clean) {
      return { isValid: false, error: null };
    }

    if (!/^\d+$/.test(clean)) {
      return { isValid: false, error: "Only numbers allowed" };
    }

    const type = detectCardType(clean);
    if (!type) {
      return { isValid: false, error: "Invalid card type" };
    }

    if (clean.length < type.maxLength) {
      return { isValid: false, error: null };
    }

    if (clean.length > type.maxLength) {
      return { isValid: false, error: "Card number too long" };
    }

    if (!luhnCheck(clean)) {
      return { isValid: false, error: "Invalid card number" };
    }

    return { isValid: true, error: null };
  };

  // Validate expiry
  const validateExpiry = (
    value: string,
  ): { isValid: boolean; error: string | null } => {
    const clean = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");

    if (!clean) {
      return { isValid: false, error: null };
    }

    if (clean.length < 4) {
      return { isValid: false, error: null };
    }

    const month = parseInt(clean.substring(0, 2));
    const year = parseInt("20" + clean.substring(2, 4));

    if (month < 1 || month > 12) {
      return { isValid: false, error: "Invalid month" };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) {
      return { isValid: false, error: "Card expired" };
    }

    if (year === currentYear && month < currentMonth) {
      return { isValid: false, error: "Card expired" };
    }

    return { isValid: true, error: null };
  };

  // Validate CVV
  const validateCvv = (
    value: string,
  ): { isValid: boolean; error: string | null } => {
    const clean = value.replace(/\s+/g, "");

    if (!clean) {
      return { isValid: false, error: null };
    }

    if (!/^\d+$/.test(clean)) {
      return { isValid: false, error: "Only numbers allowed" };
    }

    const expectedLength = cardType?.cvvLength || 3;

    if (clean.length < expectedLength) {
      return { isValid: false, error: null };
    }

    if (clean.length > expectedLength) {
      return {
        isValid: false,
        error: `CVV should be ${expectedLength} digits`,
      };
    }

    return { isValid: true, error: null };
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);

    const type = detectCardType(value);
    setCardType(type);

    const validation = validateCardNumber(value);
    setIsCardNumberValid(validation.isValid);
    setCardNumberError(validation.error);
  };

  const formatExpiry = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");

    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }

    return v;
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setExpiry(formatted);

    const validation = validateExpiry(value);
    setIsExpiryValid(validation.isValid);
    setExpiryError(validation.error);
  };

  const handleCvvChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    setCvv(clean);

    const validation = validateCvv(clean);
    setIsCvvValid(validation.isValid);
    setCvvError(validation.error);
  };

  const handleSubmit = () => {
    const cardValidation = validateCardNumber(cardNumber);
    const expiryValidation = validateExpiry(expiry);
    const cvvValidation = validateCvv(cvv);

    if (!cardValidation.isValid) {
      setCardNumberError(cardValidation.error || "Invalid card number");
      return;
    }

    if (!expiryValidation.isValid) {
      setExpiryError(expiryValidation.error || "Invalid expiry date");
      return;
    }

    if (!cvvValidation.isValid) {
      setCvvError(cvvValidation.error || "Invalid CVV");
      return;
    }

    const cleanNumber = cardNumber.replace(/\s+/g, "");
    const cleanExpiry = expiry.replace(/\s+/g, "").replace("/", "");

    onSubmit({
      number: cleanNumber,
      expiry: cleanExpiry,
      cvv: cvv,
    });
  };

  const isValid = isCardNumberValid && isExpiryValid && isCvvValid;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Card number
        </label>
        <div
          className={`relative flex items-center border rounded-lg transition-all duration-200 bg-white ${
            focused === "number"
              ? "border-black ring-1 ring-black"
              : cardNumberError && cardNumber
                ? "border-red-300"
                : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <CreditCard className="w-4 h-4 text-gray-400 absolute left-3" />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            onFocus={() => setFocused("number")}
            onBlur={() => setFocused(null)}
            placeholder="4242 4242 4242 4242"
            maxLength={
              cardType
                ? cardType.maxLength + Math.floor(cardType.maxLength / 4)
                : 19
            }
            className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-black placeholder:text-gray-400 text-base"
            disabled={isProcessing}
          />

          <AnimatePresence>
            {cardType && !cardNumberError && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-3"
              >
                <span className="text-xs font-medium text-gray-500">
                  {cardType.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {cardNumberError && cardNumber && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 flex items-center gap-1.5 text-red-500"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs">{cardNumberError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCardNumberValid && !cardNumberError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-green-600"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs">Valid card</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Expiry
          </label>
          <div
            className={`relative flex items-center border rounded-lg transition-all duration-200 bg-white ${
              focused === "expiry"
                ? "border-black ring-1 ring-black"
                : expiryError && expiry
                  ? "border-red-300"
                  : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              value={expiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              onFocus={() => setFocused("expiry")}
              onBlur={() => setFocused(null)}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-black placeholder:text-gray-400 text-base"
              disabled={isProcessing}
            />
          </div>

          <AnimatePresence>
            {expiryError && expiry && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1.5 flex items-center gap-1.5 text-red-500"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs">{expiryError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExpiryValid && !expiryError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs">Valid</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            CVV
          </label>
          <div
            className={`relative flex items-center border rounded-lg transition-all duration-200 bg-white ${
              focused === "cvv"
                ? "border-black ring-1 ring-black"
                : cvvError && cvv
                  ? "border-red-300"
                  : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              value={cvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              onFocus={() => setFocused("cvv")}
              onBlur={() => setFocused(null)}
              placeholder={cardType?.cvvLength === 4 ? "1234" : "123"}
              maxLength={cardType?.cvvLength || 3}
              className="w-full pl-10 pr-4 py-3 bg-transparent outline-none text-black placeholder:text-gray-400 text-base"
              disabled={isProcessing}
            />
          </div>

          <AnimatePresence>
            {cvvError && cvv && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1.5 flex items-center gap-1.5 text-red-500"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs">{cvvError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isCvvValid && !cvvError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-green-600"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs">Valid</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
