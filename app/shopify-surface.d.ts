/**
 * Type augmentation for Shopify Surface web components missing from @shopify/polaris-types.
 * These components are valid at runtime but not yet in the published type definitions.
 */
import type { HTMLAttributes, DetailedHTMLProps } from "react";

type SurfaceElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  [key: string]: unknown;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": SurfaceElement;
    }
  }
}

export {};
