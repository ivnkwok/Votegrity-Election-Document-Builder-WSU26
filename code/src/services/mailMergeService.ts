import type { CanvasItem } from "@/lib/utils";

export const MAIL_MERGE_TOOL_SOURCE_IDS = {
  voterAddress: "voter-address",
  voterPin: "voter-pin",
} as const;

type CanonicalField =
  | "name"
  | "addressLine1"
  | "addressLine2"
  | "cityStateZip"
  | "country"
  | "pin";

const REQUIRED_FIELDS: Array<CanonicalField> = [
  "name",
  "addressLine1",
  "cityStateZip",
  "pin",
];

const FIELD_ALIASES: Record<CanonicalField, string[]> = {
  name: [
    "name",
    "votername",
    "voterfullname",
    "fullname",
    "fulllegalname",
    "displayname",
    "voter",
  ],
  addressLine1: [
    "addressline1",
    "address1",
    "line1",
    "street",
    "street1",
    "mailingaddress1",
    "voteraddressline1",
  ],
  addressLine2: [
    "addressline2",
    "address2",
    "line2",
    "street2",
    "mailingaddress2",
    "voteraddressline2",
    "unit",
    "apartment",
    "suite",
  ],
  cityStateZip: [
    "citystatezip",
    "citystatepostal",
    "citystatezipcode",
    "citystatepostalcode",
    "citystate",
    "csz",
    "citystzip",
  ],
  country: [
    "country",
    "countryname",
    "countrycode",
  ],
  pin: [
    "pin",
    "voterpin",
    "securitypin",
    "voteridpin",
    "postalpin",
  ],
};

const COMPOSITE_ADDRESS_ALIASES = [
  "address",
  "voteraddress",
  "mailingaddress",
];

const CITY_ALIASES = ["city", "town", "municipality"];
const STATE_ALIASES = ["state", "province", "region", "territory"];
const ZIP_ALIASES = ["zip", "zipcode", "postal", "postalcode", "postcode"];

interface NormalizedFieldCandidate {
  name: string;
  addressLine1: string;
  addressLine2: string;
  cityStateZip: string;
  country: string;
  pin: string;
}

interface RowCandidate {
  rowIndex: number;
  row: Record<string, unknown>;
}

interface RowCollectionResult {
  rows: RowCandidate[];
  issues: VoterValidationIssue[];
}

interface CompositeAddressParts {
  addressLine1?: string;
  addressLine2?: string;
  cityStateZip?: string;
  country?: string;
}

export interface NormalizedVoterRecord {
  rowIndex: number;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  cityStateZip: string;
  country?: string;
  pin: string;
}

export interface VoterValidationIssue {
  rowIndex: number;
  message: string;
  missingFields?: Array<"name" | "addressLine1" | "cityStateZip" | "pin">;
}

export interface VoterParseResult {
  totalRows: number;
  validRecords: NormalizedVoterRecord[];
  issues: VoterValidationIssue[];
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toLooseRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeScalar(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value).trim();
  }
  return "";
}

function toNormalizedLookup(record: Record<string, unknown>): Record<string, unknown> {
  const lookup: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    lookup[normalizeKey(key)] = value;
  }
  return lookup;
}

function readRawAliasValue(lookup: Record<string, unknown>, aliases: string[]): unknown {
  for (const alias of aliases) {
    if (alias in lookup) {
      return lookup[alias];
    }
  }
  return undefined;
}

function readAliasValue(lookup: Record<string, unknown>, aliases: string[]): string {
  const value = readRawAliasValue(lookup, aliases);
  return normalizeScalar(value);
}

function buildCityStateZip(city: string, state: string, zip: string): string {
  const trimmedCity = city.trim();
  const trimmedState = state.trim();
  const trimmedZip = zip.trim();

  if (trimmedCity && trimmedState && trimmedZip) {
    return `${trimmedCity}, ${trimmedState} ${trimmedZip}`;
  }

  if (trimmedCity && trimmedState) {
    return `${trimmedCity}, ${trimmedState}`;
  }

  if (trimmedCity && trimmedZip) {
    return `${trimmedCity} ${trimmedZip}`;
  }

  if (trimmedState && trimmedZip) {
    return `${trimmedState} ${trimmedZip}`;
  }

  return trimmedCity || trimmedState || trimmedZip;
}

function buildCityStateZipFallback(lookup: Record<string, unknown>): string {
  const city = readAliasValue(lookup, CITY_ALIASES);
  const state = readAliasValue(lookup, STATE_ALIASES);
  const zip = readAliasValue(lookup, ZIP_ALIASES);
  return buildCityStateZip(city, state, zip);
}

function extractCompositeAddress(value: unknown): CompositeAddressParts {
  if (typeof value === "string") {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      addressLine1: lines[0],
      addressLine2: lines[1],
      cityStateZip: lines[2],
      country: lines[3],
    };
  }

  if (Array.isArray(value)) {
    const lines = value
      .map((entry) => normalizeScalar(entry))
      .filter(Boolean);

    return {
      addressLine1: lines[0],
      addressLine2: lines[1],
      cityStateZip: lines[2],
      country: lines[3],
    };
  }

  const addressObject = toLooseRecord(value);
  if (!addressObject) return {};

  const lookup = toNormalizedLookup(addressObject);
  const cityStateZip = readAliasValue(lookup, FIELD_ALIASES.cityStateZip) || buildCityStateZipFallback(lookup);

  return {
    addressLine1: readAliasValue(lookup, FIELD_ALIASES.addressLine1),
    addressLine2: readAliasValue(lookup, FIELD_ALIASES.addressLine2),
    cityStateZip,
    country: readAliasValue(lookup, FIELD_ALIASES.country),
  };
}

function extractCandidateFields(row: Record<string, unknown>): NormalizedFieldCandidate {
  const lookup = toNormalizedLookup(row);
  const compositeAddress = extractCompositeAddress(readRawAliasValue(lookup, COMPOSITE_ADDRESS_ALIASES));

  const addressLine1 = readAliasValue(lookup, FIELD_ALIASES.addressLine1) || compositeAddress.addressLine1 || "";
  const addressLine2 = readAliasValue(lookup, FIELD_ALIASES.addressLine2) || compositeAddress.addressLine2 || "";
  const cityStateZip =
    readAliasValue(lookup, FIELD_ALIASES.cityStateZip)
    || buildCityStateZipFallback(lookup)
    || compositeAddress.cityStateZip
    || "";
  const country = readAliasValue(lookup, FIELD_ALIASES.country) || compositeAddress.country || "";

  return {
    name: readAliasValue(lookup, FIELD_ALIASES.name),
    addressLine1,
    addressLine2,
    cityStateZip,
    country,
    pin: readAliasValue(lookup, FIELD_ALIASES.pin),
  };
}

function collectRowsFromArray(values: unknown[]): RowCollectionResult {
  const rows: RowCandidate[] = [];
  const issues: VoterValidationIssue[] = [];

  values.forEach((entry, index) => {
    const rowIndex = index + 1;
    const rowRecord = toLooseRecord(entry);
    if (!rowRecord) {
      issues.push({
        rowIndex,
        message: "Row is not an object and was skipped.",
      });
      return;
    }

    rows.push({ rowIndex, row: rowRecord });
  });

  return { rows, issues };
}

function collectRows(rawData: unknown): RowCollectionResult {
  if (Array.isArray(rawData)) {
    return collectRowsFromArray(rawData);
  }

  const root = toLooseRecord(rawData);
  if (!root) {
    return {
      rows: [],
      issues: [
        {
          rowIndex: 0,
          message: "Unsupported voter data format. Expected an object or array.",
        },
      ],
    };
  }

  if (Array.isArray(root.voters)) {
    return collectRowsFromArray(root.voters);
  }

  if (Array.isArray(root.columns) && Array.isArray(root.rows)) {
    const columns = root.columns.map((column, index) => {
      if (typeof column === "string" && column.trim()) {
        return column;
      }
      return `column_${index + 1}`;
    });

    const rows: RowCandidate[] = [];
    const issues: VoterValidationIssue[] = [];

    root.rows.forEach((entry, index) => {
      const rowIndex = index + 1;

      if (Array.isArray(entry)) {
        const mappedRow: Record<string, unknown> = {};
        columns.forEach((column, colIndex) => {
          mappedRow[column] = entry[colIndex];
        });
        rows.push({ rowIndex, row: mappedRow });
        return;
      }

      const rowRecord = toLooseRecord(entry);
      if (rowRecord) {
        rows.push({ rowIndex, row: rowRecord });
        return;
      }

      issues.push({
        rowIndex,
        message: "Row is not an array/object and was skipped.",
      });
    });

    return { rows, issues };
  }

  return {
    rows: [],
    issues: [
      {
        rowIndex: 0,
        message: "Unsupported voter data format. Use `voters`, an array of objects, or `columns` + `rows`.",
      },
    ],
  };
}

function formatMissingField(field: CanonicalField): string {
  switch (field) {
    case "name":
      return "name";
    case "addressLine1":
      return "addressLine1";
    case "cityStateZip":
      return "cityStateZip";
    case "pin":
      return "pin";
    default:
      return field;
  }
}

export function parseVoterData(rawData: unknown): VoterParseResult {
  const { rows, issues: structuralIssues } = collectRows(rawData);
  const structuralRowIssues = structuralIssues.filter((issue) => issue.rowIndex > 0).length;

  const validRecords: NormalizedVoterRecord[] = [];
  const issues: VoterValidationIssue[] = [...structuralIssues];

  rows.forEach(({ rowIndex, row }) => {
    const candidate = extractCandidateFields(row);

    const missingFields = REQUIRED_FIELDS.filter((field) => !candidate[field]);
    if (missingFields.length > 0) {
      issues.push({
        rowIndex,
        message: `Missing required field(s): ${missingFields.map(formatMissingField).join(", ")}.`,
        missingFields: missingFields as Array<"name" | "addressLine1" | "cityStateZip" | "pin">,
      });
      return;
    }

    const record: NormalizedVoterRecord = {
      rowIndex,
      name: candidate.name,
      addressLine1: candidate.addressLine1,
      cityStateZip: candidate.cityStateZip,
      pin: candidate.pin,
    };

    if (candidate.addressLine2) {
      record.addressLine2 = candidate.addressLine2;
    }

    if (candidate.country) {
      record.country = candidate.country;
    }

    validRecords.push(record);
  });

  return {
    totalRows: rows.length + structuralRowIssues,
    validRecords,
    issues,
  };
}

export function formatVoterAddressBlock(voter: NormalizedVoterRecord): string {
  return [
    voter.name,
    voter.addressLine1,
    voter.addressLine2,
    voter.cityStateZip,
    voter.country,
  ]
    .map((line) => (line ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

export function applyVoterMergeToItems(items: CanvasItem[], voter: NormalizedVoterRecord): CanvasItem[] {
  return items.map((item) => {
    if (item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterAddress) {
      return {
        ...item,
        content: formatVoterAddressBlock(voter),
      };
    }

    if (item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterPin) {
      return {
        ...item,
        content: voter.pin,
      };
    }

    return item;
  });
}

export function containsMailMergeTool(items: CanvasItem[]): boolean {
  return items.some(
    (item) =>
      item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterAddress
      || item.sourceToolId === MAIL_MERGE_TOOL_SOURCE_IDS.voterPin
  );
}

export function documentContainsMailMergeTools(
  pageOrder: string[],
  pagesById: Record<string, CanvasItem[]>
): boolean {
  return pageOrder.some((pageId) => containsMailMergeTool(pagesById[pageId] ?? []));
}
