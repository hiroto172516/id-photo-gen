"use client";

import { track as trackVercelEvent } from "@vercel/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __trackedEvents?: Array<{
      name: string;
      params?: Record<string, string | number | boolean>;
    }>;
  }
}

export type AnalyticsEventName =
  | "shoot_started"
  | "photo_processed"
  | "feedback_submitted"
  | "single_download"
  | "lprint_download"
  | "upload_completed"
  | "share_clicked";

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

function compactParams(params?: AnalyticsEventParams) {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter((entry): entry is [string, string | number | boolean] => {
    return entry[1] !== undefined;
  });

  return Object.fromEntries(entries);
}

export function trackEvent(name: AnalyticsEventName, params?: AnalyticsEventParams) {
  const compactedParams = compactParams(params);

  try {
    trackVercelEvent(name, compactedParams);
  } catch {
    // Vercel Analytics が使えない環境でも UI を止めない
  }

  if (typeof window !== "undefined") {
    window.__trackedEvents = window.__trackedEvents ?? [];
    window.__trackedEvents.push({
      name,
      params: compactedParams,
    });
  }

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", name, compactedParams ?? {});
}
