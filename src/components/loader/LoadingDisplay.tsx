import { motion } from "framer-motion";

export function LoadingDisplay() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-110"
      >
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-15 h-15 rounded-md flex items-center justify-center overflow-hidden">
              <img
                src="/logo.JPG"
                alt="Payfake"
                className="w-15 h-15 object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-600 tracking-wide">
              PAYFAKE
            </span>
          </div>

          <div className="h-7 w-48 bg-gray-100 rounded-md animate-pulse mb-2" />

          <div className="h-10 w-64 bg-gray-100 rounded-md animate-pulse mb-1" />

          <div className="h-4 w-56 bg-gray-100 rounded-md animate-pulse" />
        </div>

        <div className="flex gap-2 mb-8">
          <div className="flex-1 h-11 bg-gray-100 rounded-lg animate-pulse" />
          <div className="flex-1 h-11 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        <div className="space-y-5">
          <div>
            <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse mb-1.5" />
            <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 w-16 bg-gray-100 rounded-md animate-pulse mb-1.5" />
              <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-12 bg-gray-100 rounded-md animate-pulse mb-1.5" />
              <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mt-2" />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 bg-gray-100 rounded-md animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded-md animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
