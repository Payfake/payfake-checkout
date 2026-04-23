import { useState } from "react";
import { motion } from "framer-motion";
import { Building, ChevronDown, Check } from "lucide-react";

interface BankFormProps {
  onSubmit: (data: { bank_code: string; account_number: string }) => void;
  isProcessing: boolean;
}

const banks = [
  { code: "GCB", name: "GCB Bank" },
  { code: "CBG", name: "Consolidated Bank Ghana" },
  { code: "ABG", name: "Access Bank Ghana" },
  { code: "CAL", name: "CAL Bank" },
  { code: "ECO", name: "Ecobank Ghana" },
  { code: "FBL", name: "Fidelity Bank" },
  { code: "GTB", name: "GTBank Ghana" },
  { code: "SCB", name: "Stanbic Bank" },
  { code: "STD", name: "Standard Chartered" },
  { code: "UBA", name: "UBA Ghana" },
  { code: "ZEN", name: "Zenith Bank" },
];

export function BankForm({ onSubmit, isProcessing }: BankFormProps) {
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const selectedBank = banks.find((b) => b.code === bankCode);

  const validateAccountNumber = (value: string): boolean => {
    return value.length >= 10 && /^\d+$/.test(value);
  };

  const handleAccountChange = (value: string) => {
    const clean = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    setAccountNumber(clean);

    if (clean && !validateAccountNumber(clean)) {
      setAccountError("Account number must be at least 10 digits");
    } else {
      setAccountError(null);
    }
  };

  const handleSubmit = () => {
    if (bankCode && accountNumber && validateAccountNumber(accountNumber)) {
      onSubmit({ bank_code: bankCode, account_number: accountNumber });
    }
  };

  const isValid =
    bankCode && accountNumber && validateAccountNumber(accountNumber);

  return (
    <div className="space-y-5">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bank
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
            <Building className="w-4 h-4 text-gray-400" />
            <span
              className={`${selectedBank ? "text-black" : "text-gray-400"}`}
            >
              {selectedBank?.name || "Select bank"}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
            >
              {banks.map((bank, index) => (
                <motion.button
                  key={bank.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  whileHover={{ backgroundColor: "#fafafa" }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => {
                    setBankCode(bank.code);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="text-black">{bank.name}</span>
                  {bankCode === bank.code && (
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Account Number
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => handleAccountChange(e.target.value)}
          className={`w-full px-4 py-3 bg-white border rounded-lg outline-none text-black placeholder:text-gray-400 transition-colors ${
            accountError
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-black"
          }`}
          placeholder="Enter account number"
          maxLength={15}
          disabled={isProcessing}
        />
        {accountError && (
          <p className="text-red-500 text-xs mt-1.5">{accountError}</p>
        )}
      </div>

      <motion.button
        whileHover={
          !isProcessing && isValid ? { backgroundColor: "#1a1a1a" } : {}
        }
        whileTap={!isProcessing && isValid ? { scale: 0.98 } : {}}
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing || !isValid}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer ${
          isProcessing
            ? "bg-gray-400 text-white cursor-not-allowed"
            : !isValid
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900"
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
