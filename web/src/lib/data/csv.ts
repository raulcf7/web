import Papa from "papaparse";
import type { CsvValue, CsvWarning } from "@/types/data";

export interface CsvSchema {
  dataset: string;
  path: string;
  numberFields?: readonly string[];
  booleanFields?: readonly string[];
  requiredFields?: readonly string[];
}

const csvWarnings: CsvWarning[] = [];

export function clearCsvWarnings() {
  csvWarnings.length = 0;
}

export function getCsvWarnings() {
  return [...csvWarnings];
}

export async function loadCsvRows<T extends object>(schema: CsvSchema): Promise<T[]> {
  const response = await fetch(schema.path);

  if (!response.ok) {
    addWarning(schema.dataset, `Could not load ${schema.path}: ${response.status} ${response.statusText}`);
    return [];
  }

  const text = await response.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    for (const error of parsed.errors.slice(0, 5)) {
      addWarning(schema.dataset, `CSV parse warning: ${error.message}`);
    }
  }

  const fields = new Set(parsed.meta.fields ?? []);
  const missing = (schema.requiredFields ?? []).filter((field) => !fields.has(field));

  if (missing.length > 0) {
    addWarning(schema.dataset, "Missing important columns", missing);
  }

  const numberFields = new Set(schema.numberFields ?? []);
  const booleanFields = new Set(schema.booleanFields ?? []);

  return parsed.data.map((row) => coerceRow(row, numberFields, booleanFields) as T);
}

function coerceRow(
  row: Record<string, string>,
  numberFields: Set<string>,
  booleanFields: Set<string>,
): Record<string, CsvValue> {
  const clean: Record<string, CsvValue> = {};

  for (const [key, rawValue] of Object.entries(row)) {
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

    if (value === "") {
      clean[key] = null;
      continue;
    }

    if (booleanFields.has(key)) {
      clean[key] = toBoolean(value);
      continue;
    }

    if (numberFields.has(key)) {
      clean[key] = toNumber(value);
      continue;
    }

    clean[key] = value;
  }

  return clean;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: string) {
  const normalized = value.toLowerCase();

  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }

  return null;
}

function addWarning(dataset: string, message: string, columns?: string[]) {
  const warning = { dataset, message, columns };
  csvWarnings.push(warning);
  console.warn(`[data:${dataset}] ${message}`, columns ?? "");
}
