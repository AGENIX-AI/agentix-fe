import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef, type ElementType } from "react";

export interface TypographyProps<T extends ElementType = ElementType>
  extends HTMLAttributes<HTMLElement> {
  as?: T;
}

const H1 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h1", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
          className
        )}
        {...props}
      />
    );
  }
);
H1.displayName = "H1";

const H2 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h2", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
          className
        )}
        {...props}
      />
    );
  }
);
H2.displayName = "H2";

const H3 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h3", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-2xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
H3.displayName = "H3";

const H4 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h4", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
H4.displayName = "H4";

const H5 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h5", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-lg font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
H5.displayName = "H5";

const H6 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h6", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-base font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
H6.displayName = "H6";

const H7 = forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, as: Component = "h6", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20 text-sm font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);
H7.displayName = "H7";

const P = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "text-xs leading-7 [&:not(:first-child)]:mt-6",
          className
        )}
        {...props}
      />
    );
  }
);
P.displayName = "P";

const Lead = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("text-xl text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
Lead.displayName = "Lead";

const Large = forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, as: Component = "div", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    );
  }
);
Large.displayName = "Large";

const Small = forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, as: Component = "small", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("text-sm font-medium leading-none", className)}
        {...props}
      />
    );
  }
);
Small.displayName = "Small";

const ExtraSmall = forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, as: Component = "small", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("text-xs font-medium leading-none", className)}
        {...props}
      />
    );
  }
);
ExtraSmall.displayName = "ExtraSmall";

const Muted = forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, as: Component = "p", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
Muted.displayName = "Muted";

const Blockquote = forwardRef<HTMLQuoteElement, TypographyProps>(
  ({ className, as: Component = "blockquote", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn("mt-6 border-l-2 pl-6 italic", className)}
        {...props}
      />
    );
  }
);
Blockquote.displayName = "Blockquote";

const Code = forwardRef<HTMLElement, TypographyProps>(
  ({ className, as: Component = "code", ...props }, ref) => {
    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Code.displayName = "Code";

export {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  H7,
  P,
  Lead,
  Large,
  Small,
  Muted,
  Blockquote,
  Code,
  ExtraSmall,
};
