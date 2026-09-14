import type { CSSProperties } from "react";

export function FullPhoto({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // The optimizer was serving soft, downsized frames. Load the file as-is.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className ?? "absolute inset-0 h-full w-full object-cover"} style={style} />
  );
}
