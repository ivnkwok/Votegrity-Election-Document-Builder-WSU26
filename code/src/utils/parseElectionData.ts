// parseElection.ts

// Raw question type (matches the structure of your JSON)
export interface RawQuestion {
  id: number;
  question: string;
  answers: string[];
  // You can add extra fields if needed
}

// Question dictionary type with properties
export interface QuestionProperties {
  text: string;
  max?: number;
  min?: number;
  open?: boolean;
  // Add other properties here if needed
}

// Function to parse election data
export function parseElection(data: RawQuestion[]) {
  // Questions dictionary: key = question id, value = properties object
  const questions: Record<number, QuestionProperties> = {};

  // Answers dictionary: key = question id, value = array of strings
  const answers: Record<number, string[]> = {};

  // Parse each raw question
  data.forEach((q) => {
    // Store question with properties
    questions[q.id] = {
      text: q.question,
      max: 9,      // example property
      min: 0,      // example property
      open: true,  // example property
    };

    // Store answers, replace Write-in with 10 spaces
    answers[q.id] = q.answers.map((a) => (a === "Write-in" ? "          " : a));
  });

  return { questions, answers };
}