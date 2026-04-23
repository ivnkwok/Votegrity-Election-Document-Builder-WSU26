import { describe, expect, it } from "vitest";
import type { CanvasItem } from "@/lib/utils";
import {
  MAIL_MERGE_TOOL_SOURCE_IDS,
  applyVoterMergeToItems,
  formatVoterAddressBlock,
  parseVoterData,
} from "@/services/mailMergeService";

describe("mailMergeService.parseVoterData", () => {
  it("parses voters[] format and preserves leading-zero PIN strings", () => {
    const raw = {
      voters: [
        {
          name: "Avery Johnson",
          addressLine1: "1221 W Riverside Ave",
          addressLine2: "Unit 4B",
          cityStateZip: "Spokane, WA 99201",
          country: "USA",
          pin: "001245",
        },
      ],
    };

    const result = parseVoterData(raw);

    expect(result.totalRows).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.validRecords[0]).toMatchObject({
      name: "Avery Johnson",
      addressLine1: "1221 W Riverside Ave",
      cityStateZip: "Spokane, WA 99201",
      pin: "001245",
    });
  });

  it("parses plain array rows with alias keys and city/state/zip fallback", () => {
    const raw = [
      {
        "Voter Name": "Morgan Lee",
        "Address 1": "874 N Maple St",
        City: "Spokane",
        State: "WA",
        Zip: "99205",
        "Voter PIN": "774301",
      },
    ];

    const result = parseVoterData(raw);

    expect(result.validRecords).toHaveLength(1);
    expect(result.validRecords[0]).toMatchObject({
      name: "Morgan Lee",
      addressLine1: "874 N Maple St",
      cityStateZip: "Spokane, WA 99205",
      pin: "774301",
    });
  });

  it("parses columns/rows matrix format", () => {
    const raw = {
      columns: ["Voter Name", "Address Line 1", "Address Line 2", "City State Zip", "Country", "Voter PIN"],
      rows: [
        ["Jordan Kim", "4412 S Perry St", "Apt 11", "Spokane, WA 99223", "USA", "502918"],
      ],
    };

    const result = parseVoterData(raw);

    expect(result.totalRows).toBe(1);
    expect(result.validRecords).toHaveLength(1);
    expect(result.validRecords[0]).toMatchObject({
      name: "Jordan Kim",
      addressLine1: "4412 S Perry St",
      addressLine2: "Apt 11",
      cityStateZip: "Spokane, WA 99223",
      country: "USA",
      pin: "502918",
    });
  });

  it("skips rows missing required fields and reports row index", () => {
    const raw = [
      {
        name: "Riley Carter",
        addressLine1: "317 W Mission Ave",
        cityStateZip: "Spokane, WA 99201",
        pin: "660045",
      },
      {
        name: "Missing PIN",
        addressLine1: "100 Main St",
        cityStateZip: "Spokane, WA 99201",
        pin: "",
      },
    ];

    const result = parseVoterData(raw);

    expect(result.totalRows).toBe(2);
    expect(result.validRecords).toHaveLength(1);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      rowIndex: 2,
      message: expect.stringContaining("pin"),
    });
  });

  it("parses adminV2 voter rows into the existing address and pin fields", () => {
    const raw = [
      {
        election_uuid: "9f7ffa9c-b294-4bb5-9c31-2bc1341cc61a",
        name: "Christopher & Rebecca Mann",
        uuid: "fb9e38bc-3253-4fe5-bcc0-a16ffa01aff0",
        vote_hash: "BJ58V6/FqYngYm9PK+5R5EXMY+DMLqGbk/9nHTEkTGw",
        voter_phone_num: "2025550188",
        voter_address_line1: null,
        voter_address_line2: null,
        voter_city: null,
        voter_login_id: "4436 Roland Springs Drive",
        voter_state: null,
        voter_zipcode: null,
      },
    ];

    const result = parseVoterData(raw);

    expect(result.totalRows).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.validRecords[0]).toMatchObject({
      name: "Christopher & Rebecca Mann",
      addressLine1: "4436 Roland Springs Drive",
      cityStateZip: "",
      pin: "2025550188",
    });
  });
});

describe("mailMergeService merge substitution", () => {
  it("replaces only voter merge tool items and leaves other content unchanged", () => {
    const voter = {
      rowIndex: 1,
      name: "Avery Johnson",
      addressLine1: "1221 W Riverside Ave",
      addressLine2: "Unit 4B",
      cityStateZip: "Spokane, WA 99201",
      country: "USA",
      pin: "001245",
    };

    const items: CanvasItem[] = [
      {
        id: "address",
        type: "text",
        sourceToolId: MAIL_MERGE_TOOL_SOURCE_IDS.voterAddress,
        content: "{{VOTER_ADDRESS}}",
        x: 0,
        y: 0,
      },
      {
        id: "pin",
        type: "text",
        sourceToolId: MAIL_MERGE_TOOL_SOURCE_IDS.voterPin,
        content: "{{VOTER_PIN}}",
        x: 0,
        y: 40,
      },
      {
        id: "body",
        type: "text",
        sourceToolId: "text-body",
        content: "Static body text",
        x: 0,
        y: 80,
      },
    ];

    const merged = applyVoterMergeToItems(items, voter);

    expect(merged[0].content).toBe(formatVoterAddressBlock(voter));
    expect(merged[1].content).toBe("001245");
    expect(merged[2].content).toBe("Static body text");
  });
});
