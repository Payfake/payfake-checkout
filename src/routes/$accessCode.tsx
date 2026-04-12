import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "../components/checkout/CheckoutPage";
import { ErrorDisplay } from "../components/checkout/ErrorDisplay";
import { checkoutApi } from "../lib/api";
import { LoadingDisplay } from "../components/loader/LoadingDisplay";

export const Route = createFileRoute("/$accessCode")({
  loader: async ({ params }) => {
    const { accessCode } = params;

    if (accessCode.startsWith(".") || accessCode === "favicon.ico") {
      throw new Error("Invalid access code");
    }

    try {
      const response = await checkoutApi.getTransaction(accessCode);
      const tx = response.data;

      if (tx.status === "success") {
        throw new Error(
          response.message || "This transaction has already been completed",
        );
      }

      const customerName =
        tx.customer.first_name && tx.customer.last_name
          ? `${tx.customer.first_name} ${tx.customer.last_name}`
          : undefined;

      return {
        transaction: {
          access_code: tx.access_code,
          amount: tx.amount,
          currency: tx.currency,
          email: tx.customer.email,
          merchant_name: tx.merchant.business_name,
          status: tx.status,
          customer_name: customerName,
          callback_url: tx.callback_url,
        },
      };
    } catch (error: any) {
      console.error("Loader error:", error);

      // Throw the actual error message from the API
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to load payment details";

      throw new Error(message);
    }
  },
  component: RouteComponent,
  errorComponent: ({ error }) => (
    <ErrorDisplay
      message={error.message}
      onRetry={
        error.message.includes("completed")
          ? undefined
          : () => window.location.reload()
      }
    />
  ),
  pendingComponent: () => <LoadingDisplay />,
});

function RouteComponent() {
  const { transaction } = Route.useLoaderData();
  return <CheckoutPage transaction={transaction} />;
}
