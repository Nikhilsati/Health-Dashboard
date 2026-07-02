import { Biomarker } from "./healthData";

export function getStatusColor(status: Biomarker["status"]) {
  switch (status) {
    case "normal":
      return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
    case "borderline":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400";
    case "critical":
      return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
    default:
      return "text-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-400";
  }
}

export function formatValue(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
}

export function getStatusLabel(status: Biomarker["status"]) {
  switch (status) {
    case "normal":
      return "In Range";
    case "borderline":
      return "Borderline";
    case "critical":
      return "Out of Range";
    default:
      return "Unknown";
  }
}
