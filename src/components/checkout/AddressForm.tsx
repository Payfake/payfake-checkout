"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface AddressFormProps {
  onSubmit: (data: {
    address: string;
    city: string;
    postal_code: string;
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
  const [postalCode, setPostalCode] = useState("");

  const handleSubmit = () => {
    if (address && city) {
      onSubmit({ address, city, postal_code: postalCode });
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
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="Street address"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="City"
        />
        <input
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="Postal code (optional)"
        />
      </div>

      <motion.button
        whileHover={{ backgroundColor: "#1a1a1a" }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isProcessing || !isValid}
        className={`w-full py-3.5 px-4 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer ${
          isProcessing || !isValid
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {isProcessing ? "Submitting..." : "Confirm Address"}
      </motion.button>
    </div>
  );
}
