// parseElection.ts

export interface RawQuestion {
  id: number;
  question: string;
  answers: string[];
  max?: number;
  min?: number;
  open?: boolean;
}

export interface QuestionProperties {
  text: string;
  max?: number;
  min?: number;
  open?: boolean;
}

export function parseElection(data: RawQuestion[]) {
  const questions: Record<number, QuestionProperties> = {};
  const answers: Record<number, string[]> = {};

  data.forEach((q) => {
    questions[q.id] = {
      text: q.question,
      max: q.max,
      min: q.min,
      open: q.open,
    };

    answers[q.id] = q.answers.map((a) =>
      a === "Write-in" ? "          " : a
    );
  });

  // --- Print outputs ---
  console.log("Parsed Questions:");
  console.log(questions);

  console.log("Parsed Answers:");
  console.log(answers);

  return { questions, answers };
}