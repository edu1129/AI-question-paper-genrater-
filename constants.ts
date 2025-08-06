
import { LanguageOption, ObjectiveLayout } from './types';

export const APP_TITLE = "AI Question Paper Generator";
export const GEMINI_MODEL_NAME = "gemini-2.5-pro";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Japanese", label: "Japanese" },
  { value: "Bengali", label: "Bengali" },
  { value: "Telugu", label: "Telugu" },
  { value: "Marathi", label: "Marathi" },
  { value: "Tamil", label: "Tamil" },
  { value: "Urdu", label: "Urdu" },
];

export const DEFAULT_NUM_QUESTIONS = "10";
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0].value;
export const DEFAULT_QUESTION_TYPE = "Objective"; // Matches QuestionType enum string value
export const DEFAULT_OBJECTIVE_LAYOUT = ObjectiveLayout.SINGLE_LINE; // Default objective layout
export const DEFAULT_PDF_FONT_SIZE = "8"; // Default font size in points
export const DEFAULT_SHOW_PAPER_HEADER = true; // Default to showing the paper header
export const DEFAULT_IS_MATH_PAPER = false; // Default for MathJax integration

export const PDF_PREVIEW_A4_WIDTH_PX = 794; // Approx 210mm at 96 DPI
export const PDF_PREVIEW_A4_HEIGHT_PX = 1123; // Approx 297mm at 96 DPI

export const API_KEY_ERROR_MESSAGE = "Gemini API Key (process.env.API_KEY) is not configured. Please set it up to use the application.";
export const ANSWER_DELIMITER = "---ANSWERS---";
