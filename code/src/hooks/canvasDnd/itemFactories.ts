import type { CanvasItem } from "@/lib/utils";
import type { ToolDefinition } from "@/config/tools";
import type { QuestionProperties } from "@/utils/parseElectionData";
import { clampToRange } from "./positionUtils";

export function createQuestionAnswerItems(args: {
  questions: Record<number, QuestionProperties>;
  answers: Record<number, string[]>;
  startX: number;
  startY: number;
}): CanvasItem[] {
  const { questions, answers, startX, startY } = args;
  const newItems: CanvasItem[] = [];
  let currentY = startY;

  Object.keys(questions).forEach((qId) => {
    const idNum = Number(qId);
    const questionData = questions[idNum];

    const qItem: CanvasItem = {
      id: `question-${idNum}-${Date.now()}`,
      type: "text",
      sourceToolId: "question-answer",
      content: questionData.text,
      x: startX,
      y: currentY,
      width: 400,
      height: 30,
      styles: { fontWeight: "bold", fontSize: "16px" },
      flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
    };

    newItems.push(qItem);
    currentY += 35;

    const questionAnswers = answers[idNum] || [];
    questionAnswers.forEach((ansText, index) => {
      const aItem: CanvasItem = {
        id: `answer-${idNum}-${index}-${Date.now()}`,
        type: "text",
        sourceToolId: "question-answer",
        content: `[ ] ${ansText}`,
        x: startX + 20,
        y: currentY,
        width: 300,
        height: 25,
        styles: { fontSize: "14px" },
        flags: { isMovable: true, isEditable: true, minQuantity: 0, maxQuantity: 999 },
      };

      newItems.push(aItem);
      currentY += 28;
    });

    currentY += 20;
  });

  return newItems;
}

export function createToolDropItem(args: {
  toolDef: ToolDefinition;
  translatedLeft: number;
  translatedTop: number;
  canvasRect: Pick<DOMRect, "left" | "top" | "width" | "height">;
}): CanvasItem {
  const { toolDef, translatedLeft, translatedTop, canvasRect } = args;

  const newId = `${toolDef.id}-${Date.now()}`;
  const rawX = translatedLeft - canvasRect.left;
  const rawY = translatedTop - canvasRect.top;

  const x = clampToRange(rawX, 0, canvasRect.width - toolDef.defaultWidth);
  const y = clampToRange(rawY, 0, canvasRect.height - toolDef.defaultHeight);

  return {
    id: newId,
    type: toolDef.type,
    sourceToolId: toolDef.id,
    content: toolDef.type === "text" ? toolDef.defaultContent : toolDef.imageSrc,
    x,
    y,
    width: toolDef.defaultWidth,
    height: toolDef.defaultHeight,
    flags: { ...toolDef.flags },
    styles: toolDef.styles ?? {},
  };
}
