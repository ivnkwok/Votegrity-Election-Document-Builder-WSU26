export interface RawQuestion {
  id: number;
  question: string;
  answers: string[];
  max?: number;
  min?: number;
  open?: boolean;
}

export interface ElectionRecord {
  uuid: string;
  name: string;
  short_name?: string;
  questions: RawQuestion[];
  is_archived?: boolean;
}

export interface QuestionProperties {
  text: string;
  max?: number;
  min?: number;
  open?: boolean;
}

export interface ParsedElectionQuestion {
  id: number;
  question: QuestionProperties;
  answers: string[];
}

export function parseElection(data: RawQuestion[]): ParsedElectionQuestion[] {
  return data.map((question) => ({
    id: question.id,
    question: {
      text: question.question,
      max: question.max,
      min: question.min,
      open: question.open,
    },
    answers: question.answers.map((answer) => (answer === "Write-in" ? "          " : answer)),
  }));
}
