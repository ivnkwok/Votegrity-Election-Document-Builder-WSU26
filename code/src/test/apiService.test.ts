import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ElectionApiError,
  fetchAdministeredElectionRecords,
  fetchElectionData,
} from "@/services/apiService";

function createMockResponse(overrides: Partial<Response> & { contentType?: string } = {}): Response {
  const {
    contentType = "application/json",
    ok = true,
    status = 200,
    redirected = false,
    url = "https://docscreator.votegrity.net/helios/example",
    json = vi.fn(async () => ([])),
    headers,
    ...rest
  } = overrides;

  return {
    ok,
    status,
    redirected,
    url,
    json,
    headers: headers ?? {
      get: (name: string) => (name.toLowerCase() === "content-type" ? contentType : null),
    },
    ...rest,
  } as Response;
}

describe("apiService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects redirected login responses before trying to parse JSON", async () => {
    const json = vi.fn(async () => ([]));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createMockResponse({
          redirected: true,
          url: "https://docscreator.votegrity.net/auth/?return_url=/helios/elections/administered/raw",
          contentType: "text/html",
          json,
        })
      )
    );

    await expect(fetchElectionData("/helios/elections/administered/raw")).rejects.toMatchObject({
      code: "auth-redirect",
    });
    expect(json).not.toHaveBeenCalled();
  });

  it("rejects non-JSON responses even when the HTTP status is successful", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createMockResponse({
          contentType: "text/html; charset=utf-8",
        })
      )
    );

    await expect(fetchElectionData("/helios/elections/administered/raw")).rejects.toMatchObject({
      code: "invalid-content-type",
    });
  });

  it("returns typed election records for valid JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createMockResponse({
          json: vi.fn(async () => [
            {
              uuid: "abc-123",
              name: "Spring Election",
              short_name: "spring2026",
              questions: [
                {
                  id: 1,
                  question: "Board of Directors",
                  answers: ["Alice Example", "Bob Example"],
                },
              ],
            },
          ]),
        })
      )
    );

    const records = await fetchAdministeredElectionRecords();

    expect(records).toEqual([
      {
        uuid: "abc-123",
        name: "Spring Election",
        short_name: "spring2026",
        questions: [
          {
            id: 1,
            question: "Board of Directors",
            answers: ["Alice Example", "Bob Example"],
          },
        ],
      },
    ]);
    expect(records[0].questions[0].question).toBe("Board of Directors");
  });

  it("throws ElectionApiError for invalid JSON bodies", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        createMockResponse({
          json: vi.fn(async () => {
            throw new SyntaxError("Unexpected end of JSON input");
          }),
        })
      )
    );

    try {
      await fetchElectionData("/helios/elections/administered/raw");
      throw new Error("Expected fetchElectionData to throw for invalid JSON.");
    } catch (error) {
      expect(error).toBeInstanceOf(ElectionApiError);
      expect(error).toMatchObject({
        code: "invalid-json",
      });
    }
  });
});
