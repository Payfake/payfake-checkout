import { useEffect, useState } from "react";

interface ThreeDSFrameProps {
  url: string;
  reference: string;
  onComplete: () => void;
}

export function ThreeDSFrame({
  url,
  reference,
  onComplete,
}: ThreeDSFrameProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "3DS_COMPLETE" &&
        event.data?.payload?.reference === reference
      ) {
        onComplete();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [reference, onComplete]);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading 3D Secure...</p>
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-125 border border-gray-200 rounded-lg"
        onLoad={() => setLoading(false)}
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}
