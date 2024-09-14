import { type CSSProperties, type ReactNode, useMemo } from "react";

import "./style.css";

export interface LoadingProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
export const Loading = ({ children, className, style }: LoadingProps) => {
  const classNames = useMemo(() => (className ? `dv-loading ${className}` : "dv-loading"), [className]);

  return (
    <div className={classNames} style={style}>
      <svg width="50px" height="50px">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="transparent"
          strokeWidth="3"
          strokeDasharray="31.415, 31.415"
          stroke="#02bcfe"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0, 25 25;360, 25 25"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate attributeName="stroke" values="#02bcfe;#3be6cb;#02bcfe" dur="3s" repeatCount="indefinite" />
        </circle>

        <circle
          cx="25"
          cy="25"
          r="10"
          fill="transparent"
          strokeWidth="3"
          strokeDasharray="15.7, 15.7"
          stroke="#3be6cb"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="360, 25 25;0, 25 25"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate attributeName="stroke" values="#3be6cb;#02bcfe;#3be6cb" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="loading-tip">{children}</div>
    </div>
  );
};
