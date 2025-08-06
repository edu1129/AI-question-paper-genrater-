
import React from 'react';
import { FormData, QuestionType, LanguageOption, ObjectiveLayout } from '../types';
import { SUPPORTED_LANGUAGES, DEFAULT_PDF_FONT_SIZE } from '../constants';

interface ConfigFormProps {
  formData: FormData;
  onChange: (newFormData: Partial<FormData>) => void;
  disabled?: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ formData, onChange, disabled }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange({ [e.target.name]: e.target.value });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [e.target.name]: e.target.checked });
  };

  const questionTypeOptions = Object.values(QuestionType);
  const objectiveLayoutOptions = Object.values(ObjectiveLayout);

  return (
    <form className="space-y-4" aria-labelledby="config-form-heading">
      <div>
        <label htmlFor="institutionName" className="block text-sm font-medium text-sky-200 mb-1">
          School/Coaching Name
        </label>
        <input
          type="text"
          name="institutionName"
          id="institutionName"
          value={formData.institutionName}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-slate-400"
          placeholder="e.g., Elite Academy"
          aria-describedby="institutionName-desc"
        />
        <p id="institutionName-desc" className="sr-only">Enter the name of your school or coaching center.</p>
      </div>

      <div>
        <label htmlFor="numQuestions" className="block text-sm font-medium text-sky-200 mb-1">
          Number of Questions
        </label>
        <input
          type="number"
          name="numQuestions"
          id="numQuestions"
          value={formData.numQuestions}
          onChange={handleInputChange}
          min="1"
          max="50" 
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-slate-400"
          aria-describedby="numQuestions-desc"
        />
        <p id="numQuestions-desc" className="sr-only">Enter the desired number of questions (1-50).</p>
      </div>

      <div>
        <label htmlFor="selectedLanguage" className="block text-sm font-medium text-sky-200 mb-1">
          Language
        </label>
        <select
          name="selectedLanguage"
          id="selectedLanguage"
          value={formData.selectedLanguage}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200"
          aria-describedby="selectedLanguage-desc"
        >
          {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <p id="selectedLanguage-desc" className="sr-only">Select the language for the question paper.</p>
      </div>

      <div>
        <label htmlFor="questionType" className="block text-sm font-medium text-sky-200 mb-1">
          Question Type
        </label>
        <select
          name="questionType"
          id="questionType"
          value={formData.questionType}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200"
          aria-describedby="questionType-desc"
        >
          {questionTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p id="questionType-desc" className="sr-only">Select the type of questions (Objective, Subjective, or Mixed).</p>
      </div>

      {(formData.questionType === QuestionType.OBJECTIVE || formData.questionType === QuestionType.MIXED) && (
        <div>
          <label htmlFor="objectiveLayout" className="block text-sm font-medium text-sky-200 mb-1">
            Objective Question Layout
          </label>
          <select
            name="objectiveLayout"
            id="objectiveLayout"
            value={formData.objectiveLayout}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200"
            aria-describedby="objectiveLayout-desc"
          >
            {objectiveLayoutOptions.map((layout) => (
              <option key={layout} value={layout}>
                {layout}
              </option>
            ))}
          </select>
          <p id="objectiveLayout-desc" className="sr-only">Select how objective questions and their options are formatted.</p>
        </div>
      )}
      
      <div>
        <label htmlFor="pdfFontSize" className="block text-sm font-medium text-sky-200 mb-1">
          PDF Font Size (pt)
        </label>
        <input
          type="number"
          name="pdfFontSize"
          id="pdfFontSize"
          value={formData.pdfFontSize}
          onChange={handleInputChange}
          min="8"
          max="24"
          step="1"
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-slate-400"
          aria-describedby="pdfFontSize-desc"
        />
        <p id="pdfFontSize-desc" className="sr-only">Set the font size for the PDF output (e.g., 10, 11, 12). Default is {DEFAULT_PDF_FONT_SIZE}pt.</p>
      </div>

      <div>
        <label htmlFor="customPrompt" className="block text-sm font-medium text-sky-200 mb-1">
          Custom Prompt / Instructions
        </label>
        <textarea
          name="customPrompt"
          id="customPrompt"
          value={formData.customPrompt}
          onChange={handleInputChange}
          rows={3} /* Adjusted rows */
          disabled={disabled}
          className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-200 placeholder-slate-400 custom-scrollbar"
          placeholder="e.g., Focus on definitions and examples. Make 2 questions very challenging."
          aria-describedby="customPrompt-desc"
        />
        <p id="customPrompt-desc" className="sr-only">Provide any custom instructions or prompts for the AI.</p>
      </div>

      <div className="space-y-3"> {/* Group checkboxes for better spacing */}
        <label htmlFor="showPaperHeader" className="flex items-center text-sm font-medium text-sky-200 cursor-pointer">
          <input
            type="checkbox"
            name="showPaperHeader"
            id="showPaperHeader"
            checked={formData.showPaperHeader}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="mr-2 h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-600 focus:ring-sky-500 focus:ring-offset-slate-800"
          />
          Show Paper Header (Institution, Title, etc.)
        </label>
        <p id="showPaperHeader-desc" className="sr-only">Toggle the visibility of the question paper header.</p>

        <label htmlFor="isMathPaper" className="flex items-center text-sm font-medium text-sky-200 cursor-pointer">
          <input
            type="checkbox"
            name="isMathPaper"
            id="isMathPaper"
            checked={formData.isMathPaper}
            onChange={handleCheckboxChange}
            disabled={disabled}
            className="mr-2 h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-600 focus:ring-sky-500 focus:ring-offset-slate-800"
          />
          Is this a Mathematics paper? (Enable LaTeX/MathJax)
        </label>
        <p id="isMathPaper-desc" className="sr-only">Check this if the paper contains mathematical formulas to enable proper rendering.</p>
      </div>
    </form>
  );
};
