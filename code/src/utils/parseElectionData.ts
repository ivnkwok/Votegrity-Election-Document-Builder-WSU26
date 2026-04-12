// parseElection.ts
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

export async function parseElection(electionId: string) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/backend/posts/elections/${electionId}/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch election data: ${response.status}`);
    }

    const data: RawQuestion[] | null = await response.json();

    // Check if data is valid
    if (!Array.isArray(data)) {
      throw new Error("Election data is not an array");
    }

    const questions: Record<number, QuestionProperties> = {};
    const answers: Record<number, string[]> = {};

    data.forEach((q) => {
      // Skip null or incomplete questions
      if (!q || q.id == null || !q.question || !q.answers) {
        console.warn("Skipping invalid or null question:", q);
        return;
      }

      questions[q.id] = {
        text: q.question,
        max: q.max ?? undefined,
        min: q.min ?? undefined,
        open: q.open ?? undefined,
      };

      answers[q.id] = q.answers.map((a) =>
        a == null || a === "Write-in" ? "          " : a
      );
    });

    console.log("Parsed election data:", { questions, answers });
    return { questions, answers };
  } catch (err: any) {
    console.error("Error parsing election data:", err?.message || err);
    return { questions: {}, answers: {} }; // fallback empty object
  }
}