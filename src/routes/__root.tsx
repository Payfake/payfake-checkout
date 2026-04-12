import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { ErrorDisplay } from "../components/checkout/ErrorDisplay";
import { LoadingDisplay } from "../components/loader/LoadingDisplay";
import appCss from "../styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Payfake Checkout" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous" as const,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: RootDocument,
  pendingComponent: LoadingDisplay,
  notFoundComponent: () => (
    <ErrorDisplay
      message="Payment link not found"
      onRetry={() => window.history.back()}
    />
  ),
  errorComponent: ({ error }) => (
    <ErrorDisplay
      message={error.message}
      onRetry={() => window.location.reload()}
    />
  ),
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-white text-black">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
