
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConfigForm } from './components/ConfigForm';
import { QuestionDisplay } from './components/QuestionDisplay';
import { AnswerDisplay } from './components/AnswerDisplay';
import { Spinner } from './components/Spinner';
import { Alert } from './components/Alert';
import { StorageBrowser } from './components/StorageBrowser'; // Import StorageBrowser
import { simulatedStorage } from './storageData'; // Import simulated storage data
import { generatePdfFromElement } from './services/pdfService';
import { callGeminiAPI } from './services/geminiService';
import { QuestionType, FormData, ObjectiveLayout } from './types';
import { APP_TITLE, DEFAULT_NUM_QUESTIONS, DEFAULT_LANGUAGE, DEFAULT_QUESTION_TYPE, DEFAULT_OBJECTIVE_LAYOUT, DEFAULT_PDF_FONT_SIZE, API_KEY_ERROR_MESSAGE, ANSWER_DELIMITER, DEFAULT_SHOW_PAPER_HEADER, DEFAULT_IS_MATH_PAPER } from './constants';
import { FaDownload, FaPaperPlane, FaQuestionCircle, FaLightbulb, FaCalculator, FaDatabase } from 'react-icons/fa';

const App: React.FC = () => {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[] | null>(null);
  const [dataSourceDescription, setDataSourceDescription] = useState<string | null>(null); // To show what's loaded

  const [formData, setFormData] = useState<FormData>({
    institutionName: 'My School/Coaching',
    numQuestions: DEFAULT_NUM_QUESTIONS,
    selectedLanguage: DEFAULT_LANGUAGE,
    questionType: DEFAULT_QUESTION_TYPE as QuestionType,
    objectiveLayout: DEFAULT_OBJECTIVE_LAYOUT,
    customPrompt: 'Ensure questions cover a range of topics from the provided text. For objective questions, avoid ambiguity in options.',
    pdfFontSize: DEFAULT_PDF_FONT_SIZE,
    showPaperHeader: DEFAULT_SHOW_PAPER_HEADER,
    isMathPaper: DEFAULT_IS_MATH_PAPER,
  });
  
  const [rawGeneratedContent, setRawGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTypesetting, setIsTypesetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError(API_KEY_ERROR_MESSAGE);
      setApiKeyAvailable(false);
    }
  }, []);

  const displayedQuestions = useMemo(() => {
    const parts = rawGeneratedContent.split(ANSWER_DELIMITER);
    return parts[0].trim();
  }, [rawGeneratedContent]);

  const displayedAnswers = useMemo(() => {
    const parts = rawGeneratedContent.split(ANSWER_DELIMITER);
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return isGenerating && rawGeneratedContent && !rawGeneratedContent.includes(ANSWER_DELIMITER) ? "Answers will appear here after questions..." : "";
  }, [rawGeneratedContent, isGenerating]);

  const typesetMathContent = useCallback(async () => {
    if (formData.isMathPaper && window.MathJax && (displayedQuestions || displayedAnswers)) {
      const questionArea = document.getElementById('pdf-content-area');
      const answerArea = document.getElementById('answer-content-area');
      const elementsToTypeset = [questionArea, answerArea].filter(el => el !== null) as HTMLElement[];

      if (elementsToTypeset.length > 0) {
        setIsTypesetting(true);
        try {
          await window.MathJax.startup.promise;
          await window.MathJax.typesetPromise(elementsToTypeset);
        } catch (e) {
          console.error("Error during MathJax typesetting:", e);
        } finally {
          setIsTypesetting(false);
        }
      }
    }
  }, [formData.isMathPaper, displayedQuestions, displayedAnswers]);

  useEffect(() => {
    const timer = setTimeout(() => {
        typesetMathContent();
    }, 300); 
    return () => clearTimeout(timer);
  }, [typesetMathContent]);

  const handleClearPreviousDataSourceInApp = useCallback(() => {
    setPdfText(null);
    setImageFiles(null);
    setDataSourceDescription(null);
    // setRawGeneratedContent(''); // Optionally clear generated content too
  }, []);

  const handlePdfTextExtracted = useCallback((text: string, description?: string) => {
    handleClearPreviousDataSourceInApp(); // Clear any other source
    setPdfText(text);
    setImageFiles(null); 
    setDataSourceDescription(description || `PDF text loaded (${text.length} characters).`);
    setError(null); 
  }, [handleClearPreviousDataSourceInApp]);

  const handleImageFilesSelected = useCallback((files: File[], description?: string) => {
    handleClearPreviousDataSourceInApp(); // Clear any other source
    setImageFiles(files);
    setPdfText(null); 
    setDataSourceDescription(description || `${files.length} image file(s) loaded.`);
    setError(null);
  }, [handleClearPreviousDataSourceInApp]);
  

  const handleFormChange = useCallback((newFormData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newFormData }));
  }, []);

  const handleSubmit = async () => {
    if (!pdfText && (!imageFiles || imageFiles.length === 0)) {
      setError('Please upload PDF(s)/Image(s) or select from Storage first.');
      return;
    }
    if (!apiKeyAvailable) {
      setError(API_KEY_ERROR_MESSAGE);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRawGeneratedContent(''); 

    let sourceData: string | File[];
    if (imageFiles && imageFiles.length > 0) {
      sourceData = imageFiles;
    } else if (pdfText) {
      sourceData = pdfText;
    } else {
      setError('No content source (PDF text or images) available to generate questions.');
      setIsGenerating(false);
      return;
    }

    try {
      await callGeminiAPI(
        sourceData,
        formData,
        (chunk) => {
          setRawGeneratedContent(prev => prev + chunk);
        }
      );
    } catch (err) {
      console.error('Error generating question paper:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during generation.';
      setError(errorMessage);
      setRawGeneratedContent(prev => prev + `\n\n--- ERROR ENCOUNTERED ---\n${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!displayedQuestions) { 
      setError('No question paper content to download.');
      return;
    }
    
    const previewElement = document.getElementById('pdf-content-area');
    if (!previewElement) {
        setError('Preview element not found. Cannot generate PDF.');
        return;
    }

    if (formData.isMathPaper && window.MathJax) {
      setIsTypesetting(true);
      try {
        await window.MathJax.startup.promise; 
        await window.MathJax.typesetPromise([previewElement]);
        await new Promise(resolve => setTimeout(resolve, 700));
      } catch (e) {
        console.error("Error typesetting before PDF generation:", e);
        setError("Error preparing mathematical content for PDF. PDF math might not be rendered correctly.");
      } finally {
        setIsTypesetting(false);
      }
    }
    
    previewElement.style.fontSize = `${formData.pdfFontSize}pt`;
    
    await generatePdfFromElement('pdf-content-area', `${formData.institutionName.replace(/\s+/g, '_')}_QuestionPaper.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-gray-200 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
        <h1 className="text-3xl font-bold text-center text-sky-400">{APP_TITLE}</h1>
      </header>

      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      {!apiKeyAvailable && <Alert message={API_KEY_ERROR_MESSAGE} type="error" persistent={true} />}

      <main className="flex-grow w-full max-w-[95vw] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 bg-slate-700/70 backdrop-blur-sm p-6 rounded-xl shadow-2xl flex flex-col gap-6 custom-scrollbar max-h-[calc(100vh-120px)] overflow-y-auto">
          <div>
            <h2 className="text-2xl font-semibold text-sky-300 border-b-2 border-sky-500 pb-2 mb-4 flex items-center gap-2"><FaQuestionCircle /> Configuration</h2>
            <ConfigForm formData={formData} onChange={handleFormChange} disabled={isGenerating || isTypesetting} />
          </div>

          <div>
             <h2 className="text-xl font-semibold text-sky-300 border-b border-sky-600 pb-1 mb-3 flex items-center gap-2"><FaDatabase /> Content Source</h2>
            <FileUpload 
              onPdfTextExtracted={handlePdfTextExtracted}
              onImageFilesSelected={handleImageFilesSelected}
              onClearPreviousData={handleClearPreviousDataSourceInApp} // Use the App's clearer
              onError={setError} 
              disabled={isGenerating || isTypesetting} 
            />
            <StorageBrowser
              storageData={simulatedStorage}
              onPdfTextExtracted={handlePdfTextExtracted}
              onImageFilesSelected={handleImageFilesSelected}
              onClearPreviousDataSource={handleClearPreviousDataSourceInApp} // Use the App's clearer
              onError={setError}
              disabled={isGenerating || isTypesetting}
            />
            {dataSourceDescription && <p className="text-sm text-green-400 mt-3 bg-slate-600 p-2 rounded-md">{dataSourceDescription}</p>}
          </div>
            
          <button
            onClick={handleSubmit}
            disabled={isGenerating || isTypesetting || (!pdfText && (!imageFiles || imageFiles.length === 0)) || !apiKeyAvailable}
            className="w-full mt-auto bg-sky-600 hover:bg-sky-500 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50"
            aria-label={isGenerating ? 'Generating questions' : 'Generate questions'}
          >
            {isGenerating ? <Spinner size="sm" /> : <FaPaperPlane />}
            {isGenerating ? 'Generating...' : 'Generate Questions & Answers'}
          </button>
          
          {(displayedAnswers || (isGenerating && rawGeneratedContent && !rawGeneratedContent.includes(ANSWER_DELIMITER))) && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <h2 className="text-xl font-semibold text-amber-300 mb-2 flex items-center gap-2"><FaLightbulb /> Answers</h2>
              <AnswerDisplay content={displayedAnswers} />
            </div>
          )}
        </section>

        <section className="lg:col-span-8 bg-slate-700/70 backdrop-blur-sm p-6 rounded-xl shadow-2xl flex flex-col gap-4 max-h-[calc(100vh-120px)]">
          <div className="flex justify-between items-center border-b-2 border-sky-500 pb-2">
            <h2 className="text-2xl font-semibold text-sky-300">Question Paper Preview</h2>
            {isTypesetting && (
                <span className="text-sm text-yellow-400 flex items-center gap-1">
                    <FaCalculator /> Formatting Math...
                </span>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating || isTypesetting || !displayedQuestions}
              className="bg-green-600 hover:bg-green-500 disabled:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
              aria-label="Download question paper as PDF"
            >
              <FaDownload /> Download PDF
            </button>
          </div>
          
          <div 
            id="a4-outer-preview" 
            className="flex-grow bg-gray-300 p-2 sm:p-4 rounded-md overflow-y-auto custom-scrollbar"
          >
            <div 
              id="pdf-content-area" 
              className="w-full h-auto bg-white text-black shadow-lg overflow-visible custom-scrollbar whitespace-pre-wrap"
              style={{ 
                fontSize: `${formData.pdfFontSize}pt`,
                minHeight: '200px', 
                paddingTop: formData.showPaperHeader ? '2rem' : '0px',
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingBottom: '2rem',
              }}
            >
              <QuestionDisplay 
                content={displayedQuestions} 
                institutionName={formData.institutionName}
                questionType={formData.questionType}
                numQuestions={formData.numQuestions}
                showPaperHeader={formData.showPaperHeader}
              />
            </div>
          </div>
          {isGenerating && !rawGeneratedContent && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <Spinner />
              <p className="mt-2 text-sky-300">AI is thinking... Please wait.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="text-center p-4 text-sm text-slate-400 border-t border-slate-700 mt-auto">
        Powered by Gemini AI & React. MathJax for beautiful math. Created with passion.
      </footer>
    </div>
  );
};

export default App;
