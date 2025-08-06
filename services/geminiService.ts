
import { GoogleGenAI, Part } from "@google/genai";
import { FormData, QuestionType, ObjectiveLayout } from '../types';
import { GEMINI_MODEL_NAME, ANSWER_DELIMITER } from '../constants';

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  return apiKey;
};

// Helper function to convert File object to a Gemini Part
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
}

export const callGeminiAPI = async (
  sourceContent: string | File[], // Updated to accept string or File array
  formData: FormData,
  onStreamUpdate: (chunk: string) => void
): Promise<void> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const { institutionName, numQuestions, selectedLanguage, questionType, objectiveLayout, customPrompt, isMathPaper } = formData;

  let objectiveQuestionFormattingInstruction = "";
  if (questionType === QuestionType.OBJECTIVE || questionType === QuestionType.MIXED) {
    if (objectiveLayout === ObjectiveLayout.SINGLE_LINE) {
      objectiveQuestionFormattingInstruction = `For ALL objective questions:
      - Present the question number, the full question text, and ALL its options (e.g., A, B, C, D) STRICTLY on the SAME SINGLE LINE.
      - DO NOT wrap the question or options to new lines within that single line. Ensure conciseness to fit.
      - Each new objective question (number, question, and its options) MUST start on a new line.
      - Example for single-line objective question:
        1. What is the capital of France? A) London B) Paris C) Berlin D) Rome
        2. Which gas do plants absorb? A) Oxygen B) Carbon Dioxide C) Nitrogen D) Hydrogen
      `;
    } else { // MULTI_LINE
      objectiveQuestionFormattingInstruction = `For ALL objective questions:
      - Present the question number and the full question text on one line.
      - Present EACH option (e.g., A, B, C, D) on a SEPARATE new line directly below the question.
      - Each new objective question (number and question) MUST start on a new line.
      - Example for multi-line objective question:
        1. What is the capital of France?
           A) London
           B) Paris
           C) Berlin
           D) Rome
        2. Which gas do plants absorb?
           A) Oxygen
           B) Carbon Dioxide
           C) Nitrogen
           D) Hydrogen
      `;
    }
  }

  let mathInstructions = "";
  if (isMathPaper) {
    mathInstructions = `
  MATHEMATICS CONTENT INSTRUCTIONS:
  - For ALL mathematical expressions, equations, fractions, exponents, roots, integrals, summations, Greek letters, and special mathematical symbols, you MUST use LaTeX syntax.
  - Enclose inline mathematical expressions in single dollar signs (e.g., $x^2 + y^2 = z^2$).
  - Enclose display mathematical expressions (equations on their own line) in double dollar signs (e.g., $$ \int_{a}^{b} f(x) dx = F(b) - F(a) $$).
  - Examples of LaTeX usage:
    - Fraction: $\frac{a}{b}$
    - Exponent: $x^n$
    - Square root: $\sqrt{x+y}$
    - Integral: $\int x^2 dx$
    - Summation: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
    - Common symbols: $\pm, \times, \div, \approx, \le, \ge, \rightarrow, \infty, \alpha, \beta, \theta$
  - Ensure that LaTeX is correctly formatted and complete for proper rendering by MathJax.
  - For example, a math question could be: "Solve the_equation $x^2 - 5x + 6 = 0$." Or for a more complex one: "Calculate the value of $$ \lim_{x \to 0} \frac{\sin(x)}{x} $$"
  `;
  }

  const systemInstructionText = `You are an expert AI Question Paper Generator. Your task is to create a high-quality question paper and a separate list of answers.
  
  QUESTION PAPER REQUIREMENTS:
  - Institution: ${institutionName}
  - Number of Questions: ${numQuestions}
  - Language: ${selectedLanguage}
  - Question Type: ${questionType}
  - Specific Instructions from user: ${customPrompt}
  
  ${objectiveQuestionFormattingInstruction}
  ${mathInstructions}

  For subjective questions (if any):
  - Simply list the question number and the question text. Each new subjective question should start on a new line. If it's a math paper, use LaTeX for math within subjective questions as well.

  General Formatting for Questions:
  - Ensure questions are diverse and cover different aspects of the provided text or image(s).
  - Format the output clearly, with numbering for each question.
  - Output ONLY the questions themselves in the question paper section. Do not include answers or correct options within the question paper.
  - Adhere strictly to the formatting guidelines provided, especially for objective questions and LaTeX for math if applicable.

  ANSWER SECTION REQUIREMENTS:
  - After generating ALL questions, you MUST provide a separate section for answers.
  - This section MUST start with the exact delimiter: ${ANSWER_DELIMITER}
  - After the delimiter, list the answers for all questions. For objective questions, clearly indicate the correct option (e.g., "1. B", "2. A) Paris"). For subjective questions, provide a concise model answer. If it's a math paper, use LaTeX for math within answers as well.
  - Example Answer Section:
    ${ANSWER_DELIMITER}
    1. B
    2. A) Paris 
    3. (Model answer for a subjective question... for math, e.g., The solution is $x=2$ or $x=3$.)

  Based on the following text content or image(s), generate the question paper first, then the answer section.
  The entire output (questions, then delimiter, then answers) should be in ${selectedLanguage}.
  `;

  let requestContents: string | { parts: Part[] };

  if (typeof sourceContent === 'string') {
    const userPromptText = `Text Content to use for generating questions and answers:
    ---
    ${sourceContent.substring(0, 150000)} /* Increased limit slightly for potentially larger math-heavy content */
    ---
    
    Please generate the question paper and then the answer section according to ALL system instructions.
    Strictly adhere to the requested number of questions, formatting guidelines (including LaTeX if this is a math paper), and the answer section delimiter.
    Output everything in ${selectedLanguage}.
    `;
    requestContents = userPromptText;
  } else { // It's File[]
    const imageParts: Part[] = await Promise.all(
      sourceContent.map(file => fileToGenerativePart(file))
    );
    
    const instructionTextPart: Part = {
      text: `Please generate the question paper and then the answer section according to ALL system instructions.
      The questions should be based on the content of the provided image(s).
      Strictly adhere to the requested number of questions, formatting guidelines (including LaTeX if this is a math paper), and the answer section delimiter.
      Output everything in ${selectedLanguage}.
      `
    };
    requestContents = { parts: [...imageParts, instructionTextPart] };
  }


  try {
    const response = await ai.models.generateContentStream({
      model: GEMINI_MODEL_NAME,
      contents: requestContents,
      config: {
        systemInstruction: systemInstructionText,
      }
    });

    for await (const chunk of response) {
      const currentTextChunk = chunk.text;
      if (currentTextChunk) {
         onStreamUpdate(currentTextChunk);
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        let message = `Gemini API Error: ${error.message}`;
        const typedError = error as any;
        if (typedError.response && typedError.response.data && typedError.response.data.error && typedError.response.data.error.message) {
            message = `Gemini API Error: ${typedError.response.data.error.message}`;
        } else if (typedError.message.includes('API_KEY_INVALID') || typedError.message.includes('API key not valid')) {
            message = 'The provided Gemini API Key is invalid or has expired. Please check your .env file or environment configuration.';
        } else if (typedError.message.includes('permission')) {
             message = `Gemini API Error: Permission denied. This might be due to an invalid API key or incorrect project setup. Details: ${error.message}`;
        }
        throw new Error(message);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
