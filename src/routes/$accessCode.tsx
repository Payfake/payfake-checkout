import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "../components/checkout/CheckoutPage";
import { ErrorDisplay } from "../components/checkout/ErrorDisplay";
import { checkoutApi } from "../lib/api";

export const Route = createFileRoute("/$accessCode")({
  loader: async ({ params }) => {
    const { accessCode } = params;

    if (accessCode.startsWith(".") || accessCode === "favicon.ico") {
      throw new Error("Invalid access code");
    }

    try {
      const response = await checkoutApi.getTransaction(accessCode);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("Loader error:", error);

      if (error.response?.status === 404) {
        throw new Error("Invalid payment link");
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Unable to load payment details");
    }
  },
  component: RouteComponent,
  errorComponent: ({ error }) => {
    console.log("Error component rendering:", error);
    return (
      <ErrorDisplay
        message={error.message}
        onRetry={() => window.location.reload()}
      />
    );
  },
  notFoundComponent: () => (
    <ErrorDisplay
      message="Payment link not found"
      onRetry={() => window.history.back()}
    />
  ),
});

function RouteComponent() {
  const { data } = Route.useLoaderData();

  if (!data) {
    return (
      <ErrorDisplay
        message="No transaction data found"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <CheckoutPage transaction={data} />;
}
