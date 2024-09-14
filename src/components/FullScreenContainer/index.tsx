import { type CSSProperties, forwardRef, type MutableRefObject, type ReactNode, useLayoutEffect } from "react";

import { type AutoResizeActions, useAutoResize } from "@/hooks";

import "./style.css";

export interface FullScreenContainerProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const FullScreenContainer = forwardRef<AutoResizeActions, FullScreenContainerProps>(
  ({ children, className, style }, ref) => {
    const { domRef } = useAutoResize<HTMLDivElement>(ref as MutableRefObject<AutoResizeActions>);

    useLayoutEffect(() => {
      const { width, height } = window.screen;

      Object.assign(domRef.current!.style, {
        width: `${width}px`,
        height: `${height}px`,
      });

      domRef.current!.style.transform = `scale(${document.body.clientWidth / width})`;
    });

    return (
      <div id="dv-full-screen-container" className={className} style={style} ref={domRef}>
        {children}
      </div>
    );
  }
);
