import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabledTxt",
  {
    variants: {
      variant: {
        primary:
          "bg-blue text-white hover:bg-bluePress focus-visible:focus-ring",
        ghost:
          "bg-transparent text-txt2 hover:bg-bg3 hover:text-txt1 focus-visible:focus-ring",
        green:
          "bg-green text-white hover:bg-greenPress focus-visible:focus-ring",
        red: "bg-red text-white hover:bg-redPress focus-visible:focus-ring",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-11 px-4 text-[15px]",
        lg: "h-12 px-6 text-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
