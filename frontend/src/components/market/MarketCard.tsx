import { Card } from "@/components/primitives/Card";
import { PricePill } from "./PricePill";
import { formatPercent, formatVolume } from "@/lib/format";
import { Gift, Bookmark, Bell } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { MarketCardProps } from "@/lib/types";
import Image from "next/image";

export function MarketCard(props: MarketCardProps) {
  const { thumbnailUrl, title, volumeUSD, actions } = props;

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="mb-3 flex gap-3">
        <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover"
            sizes="28px"
          />
        </div>
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-[22px] text-txt1">
          {title}
        </h3>
      </div>

      {/* Options area */}
      <div className="mb-3">
        {props.type === "dateRows" ? (
          <div className="flex flex-col gap-1.5">
            {props.rows.map((row, i) => (
              <div
                key={i}
                className="flex h-9 items-center justify-between gap-2"
              >
                <span className="text-[13px] leading-[18px] text-txt2">
                  {row.label}
                </span>
                <div className="flex gap-2">
                  <PricePill
                    kind="yes"
                    label="Yes"
                    cents={row.yesPriceCents}
                    enabled={row.yesEnabled}
                  />
                  <PricePill
                    kind="no"
                    label="No"
                    cents={row.noPriceCents}
                    enabled={row.noEnabled}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {props.items.map((item, i) => (
              <div key={i} className="flex h-8 items-center justify-between">
                <button className="text-[14px] text-txt2 transition-colors hover:text-txt1">
                  {item.name}
                </button>
                <span className="text-[18px] font-bold leading-[24px] text-txt1">
                  {formatPercent(item.percent)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] leading-[18px] text-txt2">
          {formatVolume(volumeUSD)}
        </span>
        {actions && (
          <div className="flex gap-3">
            {actions.gift && (
              <IconButton aria-label="Send gift">
                <Gift size={12} />
              </IconButton>
            )}
            {actions.bookmark && (
              <IconButton aria-label="Bookmark">
                <Bookmark size={12} />
              </IconButton>
            )}
            {actions.notify && (
              <IconButton aria-label="Get notifications">
                <Bell size={12} />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
