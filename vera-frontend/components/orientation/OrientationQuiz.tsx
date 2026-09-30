"use client";

import { useState } from "react";
import { Button, Card, CardContent } from "@/components/ui";

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
};

type Props = {
  questions: Question[];
  onComplete: (score: number) => void;
};

export function OrientationQuiz({ questions, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  function submit() {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answerIndex) correct += 1;
    }
    const score = questions.length ? (correct / questions.length) * 100 : 100;
    onComplete(score);
  }

  if (!questions.length) {
    return (
      <p className="text-sm text-[#64748b]">No quiz for this package — mark complete to continue.</p>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id} className="border-[#2A2E33]/10">
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium text-[#2A2E33]">{q.prompt}</p>
            <div className="space-y-2">
              {q.choices.map((choice, idx) => (
                <label
                  key={choice}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2A2E33]/10 px-3 py-2 text-sm hover:bg-[#f8fafc]"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === idx}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                  />
                  {choice}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" onClick={submit}>
        Submit quiz
      </Button>
    </div>
  );
}
