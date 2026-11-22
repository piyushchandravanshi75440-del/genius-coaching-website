import { type FunctionDeclaration, GoogleGenAI, Type } from '@google/genai';

export const GEMINI_TEACHER_MODEL = 'gemini-4-hydrogen';

export const ALLOWED_BOARD_ACTIONS = new Set([
  'show_lesson',
  'show_formula',
  'show_diagram',
  'create_mcq',
  'next_slide',
  'previous_slide',
  'clear_board_content',
]);

export interface BoardContext {
  activeView: 'empty' | 'lesson' | 'formula' | 'diagram' | 'mcq';
  lessonTitle?: string;
  chapter?: string;
  subject?: string;
  classLevel?: string;
  currentSlideIndex?: number;
  totalSlides?: number;
}

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ExecutedActionPayload {
  name: string;
  args: Record<string, unknown>;
}

const showLessonDeclaration: FunctionDeclaration = {
  name: 'show_lesson',
  description:
    'Display a structured multi-slide lesson on the GCC Smart Board when a chapter or topic has been specified.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      classLevel: { type: Type.STRING, description: 'Class 9 or Class 10' },
      board: { type: Type.STRING, description: 'BSEB, CBSE, or BSEB & CBSE' },
      subject: {
        type: Type.STRING,
        description: 'Science, Mathematics, Social Science, Hindi, or Sanskrit',
      },
      chapter: { type: Type.STRING, description: 'Exact chapter name or topic' },
      title: { type: Type.STRING, description: 'Clear board lesson heading' },
      slides: {
        type: Type.ARRAY,
        description: '3 to 5 sequential teaching slides for the smart board',
        items: {
          type: Type.OBJECT,
          properties: {
            heading: { type: Type.STRING, description: 'Slide title' },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 concise board-friendly bullet points',
            },
            example: {
              type: Type.STRING,
              description: 'Practical classroom example or solved illustration',
            },
            voiceSummary: {
              type: Type.STRING,
              description: 'Short spoken explanation for this slide',
            },
          },
          required: ['heading', 'keyPoints'],
        },
      },
    },
    required: ['classLevel', 'subject', 'chapter', 'title', 'slides'],
  },
};

const showFormulaDeclaration: FunctionDeclaration = {
  name: 'show_formula',
  description:
    'Display a Mathematics or Science formula card with variable definitions and a solved example on the smart board.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Formula name' },
      subject: { type: Type.STRING, description: 'Mathematics or Science' },
      formula: { type: Type.STRING, description: 'The main mathematical or scientific formula' },
      variables: {
        type: Type.ARRAY,
        description: 'List of symbols/variables and their meanings',
        items: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            meaning: { type: Type.STRING },
          },
          required: ['symbol', 'meaning'],
        },
      },
      solvedExample: {
        type: Type.OBJECT,
        description: 'Step-by-step solved numerical or board example',
        properties: {
          question: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
        },
        required: ['question', 'steps', 'answer'],
      },
    },
    required: ['title', 'subject', 'formula', 'variables', 'solvedExample'],
  },
};

const showDiagramDeclaration: FunctionDeclaration = {
  name: 'show_diagram',
  description:
    'Render a labeled educational diagram on the GCC Smart Board for Science or Mathematics topics.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Diagram title' },
      caption: { type: Type.STRING, description: 'One-line explanation for students' },
      preset: {
        type: Type.STRING,
        description:
          'Choose closest preset: ray_concave_mirror, ray_convex_lens, ohms_law_circuit, right_triangle_trig, quadratic_parabola, photosynthesis_cycle, human_heart_flow, magnetic_solenoid, or concept_flowchart',
      },
      labels: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Key labels/terms to highlight on the diagram (3 to 6 items)',
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '3 to 4 sequential steps explaining how the diagram works',
      },
    },
    required: ['title', 'caption', 'preset', 'labels', 'steps'],
  },
};

const createMcqDeclaration: FunctionDeclaration = {
  name: 'create_mcq',
  description:
    'Generate interactive board MCQs (Bihar Board / CBSE Class 9-10 pattern) and display them on the smart board.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Quiz/practice set title' },
      classLevel: { type: Type.STRING, description: 'Class 9 or Class 10' },
      subject: { type: Type.STRING, description: 'Subject name' },
      chapter: { type: Type.STRING, description: 'Chapter or topic name' },
      questions: {
        type: Type.ARRAY,
        description: '3 to 5 multiple choice questions',
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 4 options',
            },
            correctIndex: {
              type: Type.INTEGER,
              description: '0-based index of the correct option (0 to 3)',
            },
            explanation: { type: Type.STRING, description: 'Brief explanation of correct answer' },
          },
          required: ['question', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['title', 'subject', 'questions'],
  },
};

const nextSlideDeclaration: FunctionDeclaration = {
  name: 'next_slide',
  description: 'Move to the next slide of the currently displayed lesson on the GCC Smart Board.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const previousSlideDeclaration: FunctionDeclaration = {
  name: 'previous_slide',
  description: 'Move to the previous slide of the currently displayed lesson on the GCC Smart Board.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const clearBoardContentDeclaration: FunctionDeclaration = {
  name: 'clear_board_content',
  description:
    'Request clearing the current GCC Smart Board display. Requires confirmation from the teacher before clearing.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING, description: 'Why the board is being cleared' },
    },
  },
};

const BOARD_TOOLS: FunctionDeclaration[] = [
  showLessonDeclaration,
  showFormulaDeclaration,
  showDiagramDeclaration,
  createMcqDeclaration,
  nextSlideDeclaration,
  previousSlideDeclaration,
  clearBoardContentDeclaration,
];

function buildSystemInstruction(language: 'hi-IN' | 'en-IN', boardContext: BoardContext): string {
  const langLabel =
    language === 'hi-IN'
      ? 'Hindi (clear Devanagari Hindi suitable for voice speech synthesis, using standard English terms like Resistance, Trigonometry, Formula where teachers naturally use them)'
      : 'English (simple, clear Indian classroom English)';

  const contextSummary =
    boardContext.activeView === 'empty'
      ? 'Smart Board currently shows: Empty / Ready for a topic.'
      : `Smart Board currently shows: view=${boardContext.activeView}, title="${
          boardContext.lessonTitle || ''
        }", chapter="${boardContext.chapter || ''}", subject="${
          boardContext.subject || ''
        }", slide=${(boardContext.currentSlideIndex ?? 0) + 1} of ${
          boardContext.totalSlides ?? 1
        }.`;

  return `You are the official **GCC AI Teacher Assistant** at **Genius Coaching Centre (GCC), Bhabua, Kaimur (Bihar)**, assisting Prince Sir live on a MAXHUB Interactive Digital Board.

YOUR ROLE & EXPERTISE:
- Teach **Class 9 and Class 10 Science and Mathematics** (plus Social Science, Hindi, Sanskrit when requested) tailored for **Bihar Board (BSEB)** and **CBSE** exams.
- Explain concepts clearly in **Hindi**, **English**, and **Bhojpuri** (whenever the teacher asks in Bhojpuri or requests Bhojpuri explanation).
- Keep your spoken/written reply concise, warm, classroom-ready (usually 2 to 5 crisp sentences so text-to-speech playback is smooth and fast on the smart board). Put detailed bullet lists, equations, and MCQs inside the Board Action tools so students see them cleanly on the MAXHUB screen!

TEACHING MODE WORKFLOW:
1. If the teacher gives a general teaching command WITHOUT specifying a chapter (for example: "Aaj Class 10 Science padhaao" or "Teach Class 9 Maths today"), DO NOT immediately call show_lesson. First politely ask which chapter they would like to teach and suggest 3–4 important BSEB/CBSE chapters for that subject.
2. Once the chapter or topic is specified, call \`show_lesson\` with 3–5 structured sequential slides, explain Slide 1 clearly, and offer to show a diagram (\`show_diagram\`), formula (\`show_formula\`), or practice MCQs (\`create_mcq\`).
3. When the teacher says "next", "agla", "next slide", or "aage badho", call \`next_slide\` (only if there is a next slide; if already on the last slide, inform the teacher and offer MCQs).
4. When the teacher says "previous", "pichhla", or "back", call \`previous_slide\`.
5. When the teacher wants to clear the board, call \`clear_board_content\` (the UI will ask teacher confirmation—never claim the board is already cleared before confirmation).

STRICT SAFETY & HONESTY RULES:
- You can ONLY control content inside the GCC website Smart Board using the 7 declared tools: \`show_lesson\`, \`show_formula\`, \`show_diagram\`, \`create_mcq\`, \`next_slide\`, \`previous_slide\`, \`clear_board_content\`.
- NEVER claim to open or control YouTube, other Chrome tabs, Android apps, volume, or MAXHUB OS settings. If asked to control external apps, politely explain you only control the GCC Smart Board inside this website.
- Only report a board action as displayed if you actually invoked the matching tool.

PREFERRED RESPONSE LANGUAGE: ${langLabel}. (Unless the teacher explicitly requests Bhojpuri or another language in their message.)
CURRENT BOARD STATE: ${contextSummary}`;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in server Secrets. Please add GEMINI_API_KEY in Settings -> Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function validateAndSanitizeAction(
  name: string,
  args: Record<string, unknown>,
  boardContext: BoardContext
): { valid: boolean; sanitized?: ExecutedActionPayload; statusMessage: string } {
  if (!ALLOWED_BOARD_ACTIONS.has(name)) {
    return { valid: false, statusMessage: `Action "${name}" is not in the GCC board allowlist.` };
  }

  if (name === 'next_slide') {
    if (boardContext.activeView !== 'lesson' || !boardContext.totalSlides) {
      return {
        valid: false,
        statusMessage: 'No active lesson slides on the board to advance.',
      };
    }
    const idx = boardContext.currentSlideIndex ?? 0;
    if (idx + 1 >= boardContext.totalSlides) {
      return {
        valid: false,
        statusMessage: `Already on the final slide (${boardContext.totalSlides} of ${boardContext.totalSlides}).`,
      };
    }
    return { valid: true, sanitized: { name, args: {} }, statusMessage: 'Queued slide advance.' };
  }

  if (name === 'previous_slide') {
    if (boardContext.activeView !== 'lesson' || !boardContext.totalSlides) {
      return {
        valid: false,
        statusMessage: 'No active lesson slides on the board to go back.',
      };
    }
    const idx = boardContext.currentSlideIndex ?? 0;
    if (idx <= 0) {
      return {
        valid: false,
        statusMessage: 'Already on the first slide (Slide 1).',
      };
    }
    return { valid: true, sanitized: { name, args: {} }, statusMessage: 'Queued previous slide.' };
  }

  if (name === 'clear_board_content') {
    return {
      valid: true,
      sanitized: { name, args: { reason: String(args.reason || 'Teacher requested clear') } },
      statusMessage: 'Awaiting teacher confirmation to clear the board.',
    };
  }

  return {
    valid: true,
    sanitized: { name, args },
    statusMessage: `Prepared ${name} for the GCC Smart Board.`,
  };
}

export async function runTeacherAssistantTurn(params: {
  message: string;
  language: 'hi-IN' | 'en-IN';
  history: ChatHistoryTurn[];
  boardContext: BoardContext;
}): Promise<{
  reply: string;
  actions: ExecutedActionPayload[];
  requiresClearConfirmation: boolean;
  model: string;
}> {
  const ai = getGeminiClient();
  const cleanMessage = params.message.trim().slice(0, 2000);
  if (!cleanMessage) {
    throw new Error('Please provide a voice or text command.');
  }

  const contents = [
    ...params.history.slice(-10).map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text.slice(0, 2000) }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: cleanMessage }],
    },
  ];

  const systemInstruction = buildSystemInstruction(params.language, params.boardContext);

  const response1 = await ai.models.generateContent({
    model: GEMINI_TEACHER_MODEL,
    contents,
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: BOARD_TOOLS }],
    },
  });

  const functionCalls = response1.functionCalls || [];
  const acceptedActions: ExecutedActionPayload[] = [];
  let requiresClearConfirmation = false;

  if (functionCalls.length > 0) {
    const previousContent = response1.candidates?.[0]?.content;
    const functionResponseParts: Array<{
      functionResponse: { id?: string; name: string; response: Record<string, unknown> };
    }> = [];

    for (const call of functionCalls) {
      const name = call.name || '';
      const args = (call.args || {}) as Record<string, unknown>;
      const check = validateAndSanitizeAction(name, args, params.boardContext);

      if (check.valid && check.sanitized) {
        acceptedActions.push(check.sanitized);
        if (name === 'clear_board_content') {
          requiresClearConfirmation = true;
        }
      }

      functionResponseParts.push({
        functionResponse: {
          id: call.id,
          name,
          response: {
            accepted: check.valid,
            requiresConfirmation: name === 'clear_board_content',
            message: check.statusMessage,
          },
        },
      });
    }

    let replyText = (response1.text || '').trim();
    if (!replyText && previousContent) {
      const response2 = await ai.models.generateContent({
        model: GEMINI_TEACHER_MODEL,
        contents: [
          ...contents,
          previousContent,
          {
            role: 'user',
            parts: functionResponseParts,
          },
        ],
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: BOARD_TOOLS }],
        },
      });
      replyText = (response2.text || '').trim();
    }

    return {
      reply:
        replyText ||
        (requiresClearConfirmation
          ? 'Kya aap smart board ka content clear karna chahte hain? Confirm button dabayein.'
          : 'Smart board content taiyaar hai.'),
      actions: acceptedActions,
      requiresClearConfirmation,
      model: GEMINI_TEACHER_MODEL,
    };
  }

  return {
    reply: (response1.text || '').trim() || 'Main sun raha hoon, kripya apna prashn poochhein.',
    actions: [],
    requiresClearConfirmation: false,
    model: GEMINI_TEACHER_MODEL,
  };
}
