declare module 'react-katex' {
  import { ComponentType, ReactNode } from 'react';

  interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    children?: never;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}
