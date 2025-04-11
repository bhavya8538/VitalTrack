import clsx from "clsx";
import Image from "next/image";
import { StatusIcon } from "@/constants";
export const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  const spellingFix = normalizedStatus === "canceled" ? "cancelled" 
: normalizedStatus === "pending" ? "pending" : "scheduled"

  return (
    <div
  className={clsx("status-badge flex items-center gap-2 px-2 py-1 rounded-md", {
    "bg-green-600": spellingFix === "scheduled",
    "bg-blue-600": spellingFix === "pending",
    "bg-red-600": spellingFix === "cancelled", // <- updated here
  })}
>
  <Image
    src={StatusIcon[spellingFix]}
    alt={`${status} icon`}
    width={24}
    height={24}
    className="w-6 h-6 object-contain"
    unoptimized
  />
  <p
    className={clsx("text-12-semibold capitalize", {
      "text-green-100": spellingFix === "scheduled",
      "text-blue-100": spellingFix === "pending",
      "text-red-100": spellingFix === "cancelled", // <- updated here
    })}
  >
    {status}
  </p>
</div>

  );
};
