"use client";

import type { AnchorHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";
import { trackEvent, type AnalyticsEventName, type AnalyticsEventParams } from "@/lib/analytics";

type TrackedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    eventName: AnalyticsEventName;
    eventParams?: AnalyticsEventParams;
  };

export function TrackedLink({
  eventName,
  eventParams,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventParams);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
