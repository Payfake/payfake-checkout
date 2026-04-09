import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { ErrorDisplay } from "../components/checkout/ErrorDisplay";
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
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => (
    <ErrorDisplay
      message="Page not found"
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased text-white">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
