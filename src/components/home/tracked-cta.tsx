"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackCtaClick } from "@/lib/analytics";
import type { ComponentProps } from "react";

type TrackedCtaProps = {
  href: string;
  label: string;
  location: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
  children: React.ReactNode;
};

export function TrackedCta({
  href,
  label,
  location,
  variant = "default",
  size = "lg",
  className,
  children,
}: TrackedCtaProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      asChild
    >
      <Link
        href={href}
        onClick={() => trackCtaClick({ label, location, href })}
      >
        {children}
      </Link>
    </Button>
  );
}
