"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface BirthdayFormProps {
  onSubmit: (data: { birthday: string }) => void;
  isProcessing: boolean;
  displayText: string;
}

export function BirthdayForm({
  onSubmit,
  isProcessing,
  displayText,
}: BirthdayFormProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = () => {
    if (day && month && year) {
      const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      onSubmit({ birthday });
    }
  };

  const isValid = day.length === 2 && month.length === 2 && year.length === 4;

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Enter Birthday</h3>
        <p className="text-sm text-gray-500">{displayText}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          type="text"
          maxLength={2}
          value={day}
          onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, ""))}
          className="px-4 py-3 text-center bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="DD"
        />
        <input
          type="text"
          maxLength={2}
          value={month}
          onChange={(e) => setMonth(e.target.value.replace(/[^0-9]/g, ""))}
          className="px-4 py-3 text-center bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="MM"
        />
        <input
          type="text"
          maxLength={4}
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
          className="px-4 py-3 text-center bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-colors"
          placeholder="YYYY"
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
        {isProcessing ? "Verifying..." : "Confirm Birthday"}
      </motion.button>
    </div>
  );
}
