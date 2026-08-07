import type { CSSProperties, ReactNode } from "react";
import { CartesianGrid, ResponsiveContainer } from "recharts";

export const CHART = {
  grid: { strokeDasharray: "3 3", vertical: false, stroke: "#e5e5e5" },
  axisTick: { fontSize: 13, fill: "#737373" },
  axisLine: { stroke: "#e5e5e5" },
  yTick: { fontSize: 12, fill: "#a3a3a3" },
  tooltipStyle: {
    borderRadius: 8,
    border: "1px solid #e5e5e5",
    fontSize: 13,
  } as CSSProperties,
  cursor: { fill: "#fafafa" },
};

export function ChartChrome({
  height,
  className = "",
  children,
}: {
  height: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
