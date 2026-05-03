import Image from "next/image";
import clsx from "clsx";
import { getLeagueIcon } from "@/lib/assets/assets";

export function LeagueIcon({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={getLeagueIcon()}
      alt="Danish Superliga icon"
      width={size}
      height={size}
      className={clsx("object-contain", className)}
      priority={size >= 40}
    />
  );
}
