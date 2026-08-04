import type { IconName } from "@/app/_components/icon";

/**
 * Upload history fixtures — another layout sketch. The first row is authored
 * open in the design to show the rejection drawer; that is a fixed state, not
 * a default the reader can toggle.
 */

export const UPLOAD_INTRO =
  "The page that ends the “did you get our file?” thread — every Excel upload and API sync, with rows received / accepted / rejected.";

export type UploadRow = {
  icon: IconName;
  file: string;
  meta: string;
  accepted: string;
  received: string;
  rejected: string;
  expanded: boolean;
  reasons: string[];
};

export const UPLOAD_ROWS: UploadRow[] = [
  {
    icon: "file-spreadsheet",
    file: "Store_Information_Colgate_VN.xlsx",
    meta: "Excel upload · linh.tran · 12 Jan 2026 09:14",
    accepted: "1,847",
    received: "1,860",
    rejected: "13",
    expanded: true,
    reasons: ["13 rows missing STORE_ID", "0 duplicate store codes"],
  },
  {
    icon: "plug",
    file: "Journey_Plan_sync (API)",
    meta: "API · system · 14 Jan 2026 03:00",
    accepted: "12,410",
    received: "12,410",
    rejected: "0",
    expanded: false,
    reasons: [],
  },
  {
    icon: "file-spreadsheet",
    file: "Merchandiser_Information.xlsx",
    meta: "Excel upload · linh.tran · 13 Jan 2026 16:22",
    accepted: "148",
    received: "150",
    rejected: "2",
    expanded: false,
    reasons: [],
  },
  {
    icon: "file-spreadsheet",
    file: "Task_Information.xlsx",
    meta: "Excel upload · linh.tran · 13 Jan 2026 16:40",
    accepted: "16",
    received: "16",
    rejected: "0",
    expanded: false,
    reasons: [],
  },
];
