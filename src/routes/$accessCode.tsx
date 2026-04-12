import { createFileRoute, notFound } from "@tanstack/react-router";
import { CheckoutPage } from "../components/checkout/CheckoutPage";
import { ErrorDisplay } from "../components/checkout/ErrorDisplay";
import { SuccessDisplay } from "../components/checkout/SuccessDisplay";
import { checkoutApi } from "../lib/api";
import { LoadingDisplay } from "../components/loader/LoadingDisplay";

export const Route = createFileRoute("/$accessCode")({
  loader: async ({ params }) => {
    const { accessCode } = params;

    if (accessCode.startsWith(".") || accessCode === "favicon.ico") {
      throw notFound();
    }

    try {
      const response = await checkoutApi.getTransaction(accessCode);
      const tx = response.data;

      const customerName =
        tx.customer.first_name && tx.customer.last_name
          ? `${tx.customer.first_name} ${tx.customer.last_name}`
          : undefined;

      // Return everything, let the component decide what to show
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
          reference: tx.reference,
        },
        message: response.message,
      };
    } catch (error: any) {
      console.error("Loader error:", error);

      if (
        error.response?.status === 404 ||
        error.response?.data?.code === "NOT_FOUND"
      ) {
        throw notFound();
      }

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
      onRetry={() => window.location.reload()}
    />
  ),
  notFoundComponent: () => (
    <ErrorDisplay message="This payment link doesn't exist or has expired" />
  ),
  pendingComponent: () => <LoadingDisplay />,
});

function RouteComponent() {
  const { transaction, message } = Route.useLoaderData();

  // If already successful, show success page directly
  if (transaction.status === "success") {
    return (
      <SuccessDisplay
        amount={transaction.amount}
        currency={transaction.currency}
        reference={transaction.reference}
        // callbackUrl={transaction.callback_url}
        message={message}
      />
    );
  }

  // Otherwise show the checkout form
  return <CheckoutPage transaction={transaction} />;
}
