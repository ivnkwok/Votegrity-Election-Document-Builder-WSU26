export function parseElectionData(rawData: any[]) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error("Invalid election data format");
  }

  return rawData.map((election) => {
    const {
      id,
      question,
      short_name,
      choice_type,
      result_type,
      tally_type,
      min,
      max,
      open,
      answers = [],
      answer_urls = [],
      answer_urls_checked = [],
    } = election;

    // Merge candidate-level attributes
    const candidates = answers.map((name: string, index: number) => ({
      index,
      name,
      pdfUrl: answer_urls[index] || null,
      pdfUrlChecked: Boolean(answer_urls_checked[index]),
      isWriteIn: name === "Write-in",
    }));

    return {
      // Election-level attributes
      id,
      question,
      shortName: short_name,
      choiceType: choice_type,
      resultType: result_type,
      tallyType: tally_type,
      minSelections: min,
      maxSelections: max,
      isOpen: open,

      // Candidate-level array
      candidates,
    };
  });
}