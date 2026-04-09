import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

const NAV_LINKS = [
  { href: "/app/dashboard",   label: "Dashboard" },
  { href: "/app/campaigns",   label: "Campaigns" },
  { href: "/app/utm-builder", label: "UTM Builder" },
  { href: "/app/settings",    label: "Settings" },
] as const;

const loadingBarStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  height: 3,
  background: "linear-gradient(90deg, #6c63ff, #a78bfa)",
  zIndex: 9999,
  animation: "tyt-loading 1.2s ease-in-out infinite",
};

const loadingKeyframes = `
  @keyframes tyt-loading {
    0%   { width: 0%;   opacity: 1; }
    60%  { width: 85%;  opacity: 1; }
    100% { width: 95%;  opacity: 0.6; }
  }
`;

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  return (
    <AppProvider embedded apiKey={apiKey}>
      <style>{loadingKeyframes}</style>

      {/* Top loading bar */}
      {isLoading && <div style={loadingBarStyle} />}

      <s-app-nav>
        {/* hidden home route — registers /app as home for the app logo */}
        {/* @ts-expect-error – s-link is valid inside s-app-nav per Shopify docs */}
        <s-link href="/app" rel="home">Home</s-link>
        {NAV_LINKS.map(({ href, label }) => (
          // @ts-expect-error – s-link is valid inside s-app-nav per Shopify docs
          <s-link key={href} href={href}>{label}</s-link>
        ))}
      </s-app-nav>

      {/* Dim the content while loading */}
      <div style={{ opacity: isLoading ? 0.5 : 1, transition: "opacity 0.2s ease" }}>
        <Outlet />
      </div>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
