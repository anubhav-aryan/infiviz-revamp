import type { IconName } from "@/app/_components/icon";

/**
 * Upload history fixtures — another layout sketch. `expanded` is the design's
 * opening state, not a frozen one: the first row is drawn open so the drawer is
 * visible on arrival, and the reader can collapse it or open any other row that
 * has reasons to show.
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
  /** Whether the drawer starts open — seeds the toggle, it is not the truth. */
  expanded: boolean;
  /**
   * Drives the chevron: a row with no reasons has nothing to open, whatever its
   * rejected count says. Every non-zero `rejected` therefore has to itemise
   * itself here, or the audit trail dead-ends on the one row that matters.
   */
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
    reasons: ["1 row missing MERCHANDISER_ID", "1 duplicate merchandiser code"],
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
