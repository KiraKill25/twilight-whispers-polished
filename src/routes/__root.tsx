import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider, useI18n } from "../lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { initAudioPrefs } from "../lib/audio";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mourad's Ville" },
      {
        name: "description",
        content:
          "Meneur de jeu numérique pour Loup-Garou : rôles illustrés, moteur de nuit et vote du village.",
      },
      { property: "og:title", content: "Mourad's Ville" },
      {
        property: "og:description",
        content:
          "Meneur de jeu numérique pour Loup-Garou : rôles illustrés, moteur de nuit et vote du village.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Mourad's Ville" },
      { name: "twitter:description", content: "Meneur de jeu numérique pour Loup-Garou : rôles illustrés, moteur de nuit et vote du village." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8b7b3f33-f48c-4e89-bc07-dde31a427789/id-preview-f0ec2dcc--74030ee1-8ec9-4852-9a00-03a10048caf9.lovable.app-1785758711610.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8b7b3f33-f48c-4e89-bc07-dde31a427789/id-preview-f0ec2dcc--74030ee1-8ec9-4852-9a00-03a10048caf9.lovable.app-1785758711610.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initAudioPrefs();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <LandscapeNotice />
        <div className="landscape-hide">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
        <Toaster position="top-center" />
      </I18nProvider>
    </QueryClientProvider>
  );
}

function LandscapeNotice() {
  const { t } = useI18n();
  return (
    <div className="landscape-block fixed inset-0 z-[100] flex-col items-center justify-center gap-4 bg-background px-8 text-center">
      <span className="text-4xl">📱</span>
      <h2 className="neon-text text-xl font-black">{t("rotateTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("rotateText")}</p>
    </div>
  );
}
