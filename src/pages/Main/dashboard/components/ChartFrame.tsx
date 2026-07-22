import { cloneElement, isValidElement, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

type ChartElement = ReactElement<{
  height?: number;
  width?: number;
}>;

type ChartFrameProps = {
  children: ChartElement;
  height: number;
  minWidth?: number;
};

const ChartFrame = ({ children, height, minWidth = 240 }: ChartFrameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(minWidth);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(container.getBoundingClientRect().width);
      setWidth(Math.max(minWidth, nextWidth));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [minWidth]);

  return (
    <div ref={containerRef} style={{ height, minWidth: 0, width: "100%" }}>
      {isValidElement(children) ? cloneElement(children, { height, width }) : null}
    </div>
  );
};

export default ChartFrame;
