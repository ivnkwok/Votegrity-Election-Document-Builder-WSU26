import type { ElectionRecord } from "@/utils/parseElectionData";

const DOCS_CREATOR_BASE_URL = "https://docscreator.votegrity.net/helios";

export type ElectionApiErrorCode =
  | "auth-redirect"
  | "http-error"
  | "invalid-content-type"
  | "invalid-json";

interface ElectionApiErrorOptions {
  code: ElectionApiErrorCode;
  message: string;
  status?: number;
  url: string;
  contentType?: string;
}

export class ElectionApiError extends Error {
  readonly code: ElectionApiErrorCode;
  readonly status?: number;
  readonly url: string;
  readonly contentType?: string;

  constructor({ code, message, status, url, contentType }: ElectionApiErrorOptions) {
    super(message);
    this.name = "ElectionApiError";
    this.code = code;
    this.status = status;
    this.url = url;
    this.contentType = contentType;
  }
}

export function isElectionApiError(error: unknown): error is ElectionApiError {
  return error instanceof ElectionApiError;
}

export type ElectionUserRecord = Record<string, unknown>;

export interface ElectionUsersByVoters {
  voters: ElectionUserRecord[];
  [key: string]: unknown;
}

export interface ElectionUsersByColumnsRows {
  columns: string[];
  rows: Array<ElectionUserRecord | unknown[]>;
  [key: string]: unknown;
}

export type ElectionUsersResponse =
  | ElectionUserRecord[]
  | ElectionUsersByVoters
  | ElectionUsersByColumnsRows;

export function buildAdministeredElectionsUrl(): string {
  return `${DOCS_CREATOR_BASE_URL}/elections/administered/raw`;
}

export function buildElectionUsersUrl(electionUuid: string): string {
  return `${DOCS_CREATOR_BASE_URL}/elections/${electionUuid}/voters/adminV2`;
}

function getContentType(response: Response): string {
  return response.headers.get("content-type")?.toLowerCase() ?? "";
}

export async function fetchElectionData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
  });
  const contentType = getContentType(response);

  if (response.redirected) {
    throw new ElectionApiError({
      code: "auth-redirect",
      message: "Election service redirected to a login page.",
      status: response.status,
      url: response.url || url,
      contentType,
    });
  }

  if (!response.ok) {
    throw new ElectionApiError({
      code: "http-error",
      message: `Failed to fetch election data (${response.status}).`,
      status: response.status,
      url: response.url || url,
      contentType,
    });
  }

  if (!contentType.includes("application/json")) {
    throw new ElectionApiError({
      code: "invalid-content-type",
      message: "Election service returned a non-JSON response.",
      status: response.status,
      url: response.url || url,
      contentType,
    });
  }

  try {
    return await response.json() as T;
  } catch (error) {
    throw new ElectionApiError({
      code: "invalid-json",
      message: error instanceof Error ? error.message : "Election service returned invalid JSON.",
      status: response.status,
      url: response.url || url,
      contentType,
    });
  }
}

export async function fetchElectionUsers(electionUuid: string): Promise<ElectionUsersResponse> {
  return fetchElectionData<ElectionUsersResponse>(buildElectionUsersUrl(electionUuid));
}

export async function fetchAdministeredElectionRecords(): Promise<ElectionRecord[]> {
  return fetchElectionData<ElectionRecord[]>(buildAdministeredElectionsUrl());
}
