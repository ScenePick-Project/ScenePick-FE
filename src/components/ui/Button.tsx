import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:opacity-90",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        outline:
          "border border-input bg-background hover:bg-muted hover:text-muted-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-80",
        accent: "bg-accent text-accent-foreground hover:opacity-80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      shape: {
        default: "rounded",
        square: "rounded-none",
        full: "rounded-full",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({
  className,
  variant,
  shape,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, shape, size, className }))}
      ref={ref}
      {...props}
    />
  );
}

export { Button, buttonVariants };
