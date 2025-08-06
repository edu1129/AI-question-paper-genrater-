
export enum QuestionType {
  OBJECTIVE = "Objective",
  SUBJECTIVE = "Subjective",
  MIXED = "Mixed (Objective & Subjective)",
}

export enum ObjectiveLayout {
  SINGLE_LINE = "Single Line (Question & Options)",
  MULTI_LINE = "Multi-line (Options below Question)",
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface FormData {
  institutionName: string;
  numQuestions: string;
  selectedLanguage: string;
  questionType: QuestionType;
  objectiveLayout: ObjectiveLayout;
  customPrompt: string;
  pdfFontSize: string;
  showPaperHeader: boolean;
  isMathPaper: boolean; // Added for MathJax integration
}

// Declare MathJax on the window object for TypeScript
declare global {
  interface Window {
    MathJax: any;
  }
}

// Types for Simulated Storage Browser
export interface StorageFile {
  name: string;
  type: 'pdf' | 'image';
  path: string; // Simulated path, e.g., "storage/Class 10/Math/Chapter1.pdf"
  // For PDFs
  pdfTextContent?: string;
  // For Images
  base64ImageData?: string;
  mimeType?: string;
}

export interface StorageSubject {
  name: string;
  chapters: StorageFile[]; // Should only contain files of type 'pdf'
}

export interface StorageClass {
  name: string;
  subjects: StorageSubject[];
}

export interface StorageImageFolder {
  name: string; // e.g., "Model Papers", "Previous Year Question Papers"
  pathPrefix: string; // e.g., "model_paper/"
  images: StorageFile[]; // Should only contain files of type 'image'
}

export interface StorageData {
  classes: StorageClass[];
  imageFolders: StorageImageFolder[];
}
