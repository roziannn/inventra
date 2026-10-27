export type LabelSize = "S" | "M" | "L" | "XL";
export type PaperSize = "A4" | "A5" | "Letter";

/** One row of the print queue, as stored for the print layout page. */
export interface PrintItem {
  id: string;
  name: string;
  sku: string;
}

/** Payload passed from the label picker to /labeling/print/print-layout through localStorage. */
export interface PrintData {
  items: PrintItem[];
  copies: number;
  labelSize: LabelSize;
  paperSize: PaperSize;
}
