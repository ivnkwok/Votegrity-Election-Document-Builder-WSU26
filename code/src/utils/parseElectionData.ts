export interface RawQuestion {
  id: number | null;
  question: string | null;
  answers: (string | null)[] | null;
  max?: number | null;
  min?: number | null;
  open?: boolean | null;
}

export interface QuestionProperties {
  text: string;
  max?: number;
  min?: number;
  open?: boolean;
}

export async function fetchElectionData(electionId: string): Promise<RawQuestion[]> {
  const response = await fetch(
    `http://127.0.0.1:8000/api/backend/election/${electionId}/`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch election data: ${response.status}`);
  }

  const data: RawQuestion[] = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Election data is not an array");
  }

  return data;
}

export function parseElectionData(data: RawQuestion[]) {
  const questions: Record<number, QuestionProperties> = {};
  const answers: Record<number, string[]> = {};

  if (!Array.isArray(data)) {
    return { questions, answers };
  }

  data.forEach((q) => {
    if (!q || q.id == null || !q.question || !q.answers) return;

    questions[q.id] = {
      text: q.question,
      max: q.max ?? undefined,
      min: q.min ?? undefined,
      open: q.open ?? undefined,
    };

    answers[q.id] = q.answers.map((a) =>
      a == null || a === "Write-in" ? "" : a
    );
  });

  return { questions, answers };
}

export async function parseElection(electionId: string) {
  try {
    const data = await fetchElectionData(electionId);
    return parseElectionData(data);
  } catch (err) {
    console.error("Error parsing election data:", err);
    return { questions: {}, answers: {} };
  }
}
