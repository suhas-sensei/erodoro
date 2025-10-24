export type MarketCardProps =
  | {
      id: string;
      thumbnailUrl: string;
      title: string;
      type: "dateRows";
      rows: {
        label: string;
        yesPriceCents: number;
        noPriceCents: number;
        yesEnabled: boolean;
        noEnabled: boolean;
      }[];
      volumeUSD: number;
      actions?: { gift?: boolean; bookmark?: boolean; notify?: boolean };
    }
  | {
      id: string;
      thumbnailUrl: string;
      title: string;
      type: "candidates";
      items: { name: string; percent: number }[];
      volumeUSD: number;
      actions?: { gift?: boolean; bookmark?: boolean; notify?: boolean };
    };
