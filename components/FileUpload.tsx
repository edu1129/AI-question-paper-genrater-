
import React, { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FaUpload, FaFilePdf, FaImage, FaCopy } from 'react-icons/fa';
import { Spinner } from './Spinner';

interface FileUploadProps {
  onPdfTextExtracted: (text: string, description?: string) => void;
  onImageFilesSelected: (files: File[], description?: string) => void;
  onClearPreviousData: () => void; // This will clear App.tsx's state
  onError: (error: string) => void;
  disabled?: boolean;
}

const ALLOWED_PDF_TYPE = 'application/pdf';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onPdfTextExtracted, 
  onImageFilesSelected,
  onClearPreviousData,
  onError, 
  disabled 
}) => {
  const [selectedFileUIDescription, setSelectedFileUIDescription] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentUploadType, setCurrentUploadType] = useState<'pdf' | 'image' | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (files.length === 0) {
      // Don't call onClearPreviousData if simply clearing the input field without a new selection.
      // onClearPreviousData is more for when a *new* data source is confirmed.
      // However, if there was a selection and it's now cleared, we should reflect that.
      if (selectedFileUIDescription) { 
        onClearPreviousData(); // Clear if there was a previous selection from this component
      }
      setSelectedFileUIDescription(null);
      setCurrentUploadType(null);
      return;
    }

    setIsProcessing(true);
    onClearPreviousData(); // Clear any previous data in App.tsx (from StorageBrowser or previous upload)
    onError(''); // Clear previous errors

    const areAllPdfs = files.every(file => file.type === ALLOWED_PDF_TYPE);
    const areAllImages = files.every(file => ALLOWED_IMAGE_TYPES.includes(file.type));
    const localFileDescription = `${files.length} file(s) selected: ${files.map(f => f.name).join(', ').substring(0, 100)}...`;


    if (areAllPdfs) {
      setCurrentUploadType('pdf');
      setSelectedFileUIDescription(localFileDescription);
      try {
        let fullText = '';
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
          }
        }
        onPdfTextExtracted(fullText, `Uploaded: ${localFileDescription}`);
      } catch (err) {
        console.error('Error extracting text from PDF(s):', err);
        onError(err instanceof Error ? `Error processing PDF(s): ${err.message}` : 'Failed to process PDF(s).');
        setSelectedFileUIDescription(null);
        setCurrentUploadType(null);
      }
    } else if (areAllImages) {
      setCurrentUploadType('image');
      setSelectedFileUIDescription(localFileDescription);
      onImageFilesSelected(files, `Uploaded: ${localFileDescription}`);
    } else {
      setCurrentUploadType(null);
      setSelectedFileUIDescription(null);
      onError('Invalid file selection. Please upload only PDF files or only image files (JPEG, PNG, GIF, WebP). Mixed types are not supported.');
    }

    setIsProcessing(false);
    event.target.value = ''; 
  }, [onPdfTextExtracted, onImageFilesSelected, onClearPreviousData, onError, selectedFileUIDescription]);
  
  const getIcon = () => {
    if (isProcessing) return <Spinner size="sm" color="text-yellow-400" />;
    if (currentUploadType === 'pdf') return <FaFilePdf className="text-red-400 mr-2 flex-shrink-0" size={18} />;
    if (currentUploadType === 'image') return <FaImage className="text-blue-400 mr-2 flex-shrink-0" size={18} />;
    if (selectedFileUIDescription) return <FaCopy className="text-gray-400 mr-2 flex-shrink-0" size={18} />
    return <FaUpload className={`mr-2 ${disabled ? 'text-slate-500' : 'text-sky-400'}`} />;
  };


  return (
    <div className="space-y-2">
      <label htmlFor="file-upload" className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150 ease-in-out
        ${disabled ? 'border-slate-600 bg-slate-800 text-slate-500' : 'border-sky-500 hover:border-sky-400 hover:bg-slate-600 text-sky-300'}`}>
        {getIcon()}
        <span>{selectedFileUIDescription ? 'Change Uploaded File(s)' : 'Upload PDF(s) or Image(s)'}</span>
        <input
          id="file-upload"
          type="file"
          accept={`${ALLOWED_PDF_TYPE},${ALLOWED_IMAGE_TYPES.join(',')}`}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isProcessing}
          multiple
        />
      </label>
      {selectedFileUIDescription && !isProcessing && (
        <div className="flex items-center text-sm text-gray-300 bg-slate-600 p-2 rounded-md">
          {getIcon()}
          <span className="truncate" title={selectedFileUIDescription}>{selectedFileUIDescription}</span>
        </div>
      )}
      {isProcessing && <p className="text-sm text-yellow-400">Processing uploaded files...</p>}
    </div>
  );
};
