import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface AddressFormProps {
  onSubmit: (data: {
    address: string;
    city: string;
    state?: string;
    zip_code?: string;
    country?: string;
  }) => void;
  isProcessing: boolean;
  displayText: string;
}

export function AddressForm({
  onSubmit,
  isProcessing,
  displayText,
}: AddressFormProps) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("Ghana");

  const handleSubmit = () => {
    if (address && city) {
      onSubmit({
        address,
        city,
        state: state || undefined,
        zip_code: zipCode || undefined,
        country,
      });
    }
  };

  const isValid = address.length > 0 && city.length > 0;

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Enter Address</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none"
          placeholder="Street address"
          disabled={isProcessing}
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none"
          placeholder="City"
          disabled={isProcessing}
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none"
          placeholder="State/Region (optional)"
          disabled={isProcessing}
        />
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none"
          placeholder="Zip code (optional)"
          disabled={isProcessing}
        />
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none"
          placeholder="Country"
          disabled={isProcessing}
        />
      </div>

      <motion.button
        whileHover={
          !isProcessing && isValid ? { backgroundColor: "#1a1a1a" } : {}
        }
        whileTap={!isProcessing && isValid ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={isProcessing || !isValid}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer ${
          isProcessing || !isValid
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
            Submitting...
          </span>
        ) : (
          "Confirm Address"
        )}
      </motion.button>
    </div>
  );
}
