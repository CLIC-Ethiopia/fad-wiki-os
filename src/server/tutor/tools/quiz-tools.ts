/**
 * Fad.Tutor — Quiz tools.
 *
 * `generate_questions` — produce structured quiz questions from vault content.
 * `grade_answer`        — evaluate a user's answer with detailed feedback.
 * `save_to_question_bank` — persist questions to the question bank.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { registerTool } from '../tool-registry';

const QB_DIR = path.join(process.cwd(), 'data', 'tutor', 'question-bank');

/* ------------------------------------------------------------------ */
/*  generate_questions                                                */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'generate_questions',
  description:
    'Generate structured quiz questions. Return them as a JSON array so the client can render interactive cards. Each question should have: type (mcq|true_false|short_answer|fill_blank), question text, options (for mcq), correct answer, and explanation.',
  schema: {
    name: 'generate_questions',
    description: 'Generate structured quiz questions.',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'string',
          description:
            'A JSON array of question objects. Each object: { "type": "mcq"|"true_false"|"short_answer"|"fill_blank", "question": "...", "options": ["A","B","C","D"] (mcq only), "correct_answer": "...", "explanation": "..." }',
        },
        topic: {
          type: 'string',
          description: 'The topic these questions cover.',
        },
        difficulty: {
          type: 'string',
          description: 'Difficulty level: easy, medium, or hard.',
          enum: ['easy', 'medium', 'hard'],
        },
      },
      required: ['questions', 'topic'],
    },
  },
  capabilities: ['deep_question', 'mastery_path'],
  async execute(params) {
    try {
      const questions = JSON.parse(params.questions as string);
      return {
        ok: true,
        content: `Generated ${questions.length} question(s) on "${params.topic}".`,
        data: {
          questions,
          topic: params.topic,
          difficulty: params.difficulty || 'medium',
        },
        renderType: 'quiz',
      };
    } catch {
      return {
        ok: false,
        content: 'Failed to parse questions JSON. Ensure valid JSON array format.',
      };
    }
  },
});

/* ------------------------------------------------------------------ */
/*  grade_answer                                                      */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'grade_answer',
  description:
    'Grade a user\'s answer to a quiz question. Provide whether it is correct, partial feedback, and the reference answer with explanation.',
  schema: {
    name: 'grade_answer',
    description: 'Grade a quiz answer.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The original question text.',
        },
        user_answer: {
          type: 'string',
          description: "The user's submitted answer.",
        },
        correct_answer: {
          type: 'string',
          description: 'The reference correct answer.',
        },
        is_correct: {
          type: 'boolean',
          description: "Whether the user's answer is correct.",
        },
        feedback: {
          type: 'string',
          description:
            'Detailed feedback explaining why the answer is right or wrong, with hints for improvement.',
        },
      },
      required: ['question', 'user_answer', 'correct_answer', 'is_correct', 'feedback'],
    },
  },
  capabilities: ['deep_question', 'mastery_path'],
  async execute(params) {
    return {
      ok: true,
      content: params.is_correct
        ? `✅ Correct! ${params.feedback}`
        : `❌ Not quite. The correct answer is: ${params.correct_answer}\n\n${params.feedback}`,
      data: {
        isCorrect: params.is_correct,
        question: params.question,
        userAnswer: params.user_answer,
        correctAnswer: params.correct_answer,
        feedback: params.feedback,
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/*  save_to_question_bank                                             */
/* ------------------------------------------------------------------ */

registerTool({
  name: 'save_to_question_bank',
  description:
    'Save a quiz question to the persistent question bank for future review.',
  schema: {
    name: 'save_to_question_bank',
    description: 'Save a question to the question bank.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question text.',
        },
        type: {
          type: 'string',
          description: 'Question type.',
          enum: ['mcq', 'true_false', 'short_answer', 'fill_blank'],
        },
        correct_answer: {
          type: 'string',
          description: 'The correct answer.',
        },
        explanation: {
          type: 'string',
          description: 'Explanation of the answer.',
        },
        topic: {
          type: 'string',
          description: 'Topic/category.',
        },
      },
      required: ['question', 'correct_answer', 'topic'],
    },
  },
  capabilities: ['deep_question', 'mastery_path', 'chat'],
  async execute(params) {
    try {
      await fs.mkdir(QB_DIR, { recursive: true });

      const entry = {
        id: `q-${Date.now()}`,
        question: params.question,
        type: params.type || 'short_answer',
        correctAnswer: params.correct_answer,
        explanation: params.explanation || '',
        topic: params.topic,
        savedAt: new Date().toISOString(),
      };

      const filePath = path.join(QB_DIR, `${entry.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf8');

      return {
        ok: true,
        content: `Saved question to question bank: "${(params.question as string).substring(0, 60)}..."`,
      };
    } catch (error) {
      return {
        ok: false,
        content: `Failed to save question: ${(error as Error).message}`,
      };
    }
  },
});
