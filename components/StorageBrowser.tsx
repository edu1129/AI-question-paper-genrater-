
import React, { useState, useCallback, useMemo } from 'react';
import { StorageData, StorageClass, StorageSubject, StorageFile, StorageImageFolder } from '../types';
import { FaFolder, FaFilePdf, FaImage, FaChevronRight, FaChevronDown, FaCheckSquare, FaRegSquare, FaBookOpen, FaImages } from 'react-icons/fa';

interface StorageBrowserProps {
  storageData: StorageData;
  onPdfTextExtracted: (text: string, sourceDescription: string) => void;
  onImageFilesSelected: (files: File[], sourceDescription: string) => void;
  onClearPreviousDataSource: () => void; // Renamed to avoid conflict if App.tsx has same name
  onError: (error: string) => void;
  disabled?: boolean;
}

// Helper to convert base64 string to File object
function base64StringToFile(base64String: string, filename: string, mimeType: string): File {
  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  } catch (e) {
    console.error("Error converting base64 to File:", e);
    throw new Error(`Failed to convert base64 string for ${filename}.`);
  }
}


export const StorageBrowser: React.FC<StorageBrowserProps> = ({
  storageData,
  onPdfTextExtracted,
  onImageFilesSelected,
  onClearPreviousDataSource,
  onError,
  disabled,
}) => {
  const [browseMode, setBrowseMode] = useState<'pdf' | 'image' | null>(null);
  
  // PDF browsing state
  const [selectedClass, setSelectedClass] = useState<StorageClass | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<StorageSubject | null>(null);
  const [selectedPdfs, setSelectedPdfs] = useState<StorageFile[]>([]);

  // Image browsing state
  const [selectedImageFolder, setSelectedImageFolder] = useState<StorageImageFolder | null>(null);
  const [selectedImages, setSelectedImages] = useState<StorageFile[]>([]);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModeChange = (mode: 'pdf' | 'image') => {
    if (disabled) return;
    onClearPreviousDataSource(); // Clear App.tsx's pdfText and imageFiles
    setBrowseMode(mode);
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedPdfs([]);
    setSelectedImageFolder(null);
    setSelectedImages([]);
    onError(''); // Clear any previous errors from this component
  };

  const handleClassSelect = (storageClass: StorageClass) => {
    if (disabled) return;
    setSelectedClass(storageClass);
    setSelectedSubject(null);
    setSelectedPdfs([]);
  };

  const handleSubjectSelect = (subject: StorageSubject) => {
    if (disabled) return;
    setSelectedSubject(subject);
    setSelectedPdfs([]);
  };

  const handlePdfToggle = (pdfFile: StorageFile) => {
    if (disabled) return;
    setSelectedPdfs(prev =>
      prev.some(f => f.path === pdfFile.path)
        ? prev.filter(f => f.path !== pdfFile.path)
        : [...prev, pdfFile]
    );
  };

  const handleImageFolderSelect = (folder: StorageImageFolder) => {
    if (disabled) return;
    setSelectedImageFolder(folder);
    setSelectedImages([]);
  };

  const handleImageToggle = (imageFile: StorageFile) => {
    if (disabled) return;
    setSelectedImages(prev =>
      prev.some(f => f.path === imageFile.path)
        ? prev.filter(f => f.path !== imageFile.path)
        : [...prev, imageFile]
    );
  };

  const confirmPdfSelection = () => {
    if (disabled || selectedPdfs.length === 0) return;
    onClearPreviousDataSource(); // Important: clears any existing selection in App.tsx
    const combinedText = selectedPdfs.map(f => f.pdfTextContent || '').join('\n\n---\n\n');
    const description = `${selectedPdfs.length} PDF(s) from storage: ${selectedPdfs.map(f=>f.name).join(', ').substring(0,100)}...`;
    onPdfTextExtracted(combinedText, description);
    onError('');
  };

  const confirmImageSelection = async () => {
    if (disabled || selectedImages.length === 0) return;
    onClearPreviousDataSource(); // Important
    try {
      const files: File[] = selectedImages.map(img => {
        if (!img.base64ImageData || !img.mimeType) {
          throw new Error(`Image data missing for ${img.name}`);
        }
        return base64StringToFile(img.base64ImageData, img.name, img.mimeType);
      });
      const description = `${selectedImages.length} image(s) from storage: ${selectedImages.map(f=>f.name).join(', ').substring(0,100)}...`;
      onImageFilesSelected(files, description);
      onError('');
    } catch (err) {
      console.error("Error preparing image files:", err);
      onError(err instanceof Error ? err.message : "Failed to process selected images.");
    }
  };
  
  const renderItem = (name: string, icon: React.ReactNode, onClick?: () => void, level: number = 0, isSelected?: boolean, isExpandable?: boolean, isExpanded?: boolean) => {
    const indentClass = `pl-${level * 4}`;
    return (
      <button
        onClick={onClick}
        disabled={disabled && !!onClick}
        className={`w-full flex items-center text-left p-2 rounded-md transition-colors duration-150 ease-in-out
                    ${disabled ? 'text-slate-500 cursor-not-allowed' : 'hover:bg-slate-600 text-sky-200'}
                    ${isSelected ? 'bg-sky-700 text-white' : ''} ${indentClass}`}
        aria-selected={isSelected}
      >
        {icon}
        <span className="ml-2 truncate">{name}</span>
        {isExpandable && (
          <span className="ml-auto">
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </span>
        )}
      </button>
    );
  };

  const renderCheckboxItem = (file: StorageFile, isSelected: boolean, onToggle: () => void, level: number = 0) => {
     const indentClass = `pl-${level * 4}`;
    return (
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-full flex items-center text-left p-2 rounded-md transition-colors duration-150 ease-in-out
                    ${disabled ? 'text-slate-500 cursor-not-allowed' : 'hover:bg-slate-600 text-sky-200'} ${indentClass}`}
        role="checkbox"
        aria-checked={isSelected}
      >
        {isSelected ? <FaCheckSquare className="text-sky-400 mr-2" /> : <FaRegSquare className="mr-2" />}
        {file.type === 'pdf' ? <FaFilePdf className="text-red-400 mr-1" /> : <FaImage className="text-blue-400 mr-1" />}
        <span className="ml-1 truncate">{file.name}</span>
      </button>
    );
  };

  const currentSelectionDescription = useMemo(() => {
    if (browseMode === 'pdf' && selectedPdfs.length > 0) {
      return `Selected PDFs: ${selectedPdfs.length} file(s).`;
    }
    if (browseMode === 'image' && selectedImages.length > 0) {
      return `Selected Images: ${selectedImages.length} file(s).`;
    }
    return null;
  }, [browseMode, selectedPdfs, selectedImages]);

  return (
    <div className="mt-4 pt-4 border-t border-slate-600">
      <h3 className="text-lg font-semibold text-sky-300 mb-3">Browse Storage</h3>
      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => handleModeChange('pdf')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md font-medium flex items-center gap-2
            ${browseMode === 'pdf' ? 'bg-sky-600 text-white' : 'bg-slate-600 hover:bg-slate-500 text-sky-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaBookOpen /> PDFs by Class
        </button>
        <button 
          onClick={() => handleModeChange('image')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md font-medium flex items-center gap-2
            ${browseMode === 'image' ? 'bg-sky-600 text-white' : 'bg-slate-600 hover:bg-slate-500 text-sky-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaImages /> Image Collections
        </button>
      </div>

      {currentSelectionDescription && (
        <p className="text-sm text-green-400 mb-2 p-2 bg-slate-600 rounded-md">{currentSelectionDescription}</p>
      )}

      {browseMode === 'pdf' && (
        <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar p-1 bg-slate-800 rounded-md">
          {!selectedClass ? (
            storageData.classes.map(c => renderItem(c.name, <FaFolder />, () => handleClassSelect(c), 0))
          ) : !selectedSubject ? (
            <>
              {renderItem(`Back to Classes`, <FaFolder />, () => {setSelectedClass(null); setSelectedSubject(null); setSelectedPdfs([]);}, 0)}
              <h4 className="font-semibold p-2 text-sky-300">{selectedClass.name} - Select Subject:</h4>
              {selectedClass.subjects.map(s => renderItem(s.name, <FaFolder />, () => handleSubjectSelect(s), 1))}
            </>
          ) : (
            <>
              {renderItem(`Back to Subjects (${selectedClass.name})`, <FaFolder />, () => {setSelectedSubject(null); setSelectedPdfs([]);}, 0)}
              <h4 className="font-semibold p-2 text-sky-300">{selectedSubject.name} - Select Chapters:</h4>
              {selectedSubject.chapters.map(pdf => renderCheckboxItem(pdf, selectedPdfs.some(f => f.path === pdf.path), () => handlePdfToggle(pdf), 1))}
              {selectedPdfs.length > 0 && (
                <button 
                  onClick={confirmPdfSelection} 
                  disabled={disabled}
                  className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:bg-slate-500"
                >
                  Use Selected PDFs ({selectedPdfs.length})
                </button>
              )}
            </>
          )}
        </div>
      )}

      {browseMode === 'image' && (
        <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar p-1 bg-slate-800 rounded-md">
          {!selectedImageFolder ? (
            storageData.imageFolders.map(folder => renderItem(folder.name, <FaFolder />, () => handleImageFolderSelect(folder), 0))
          ) : (
            <>
              {renderItem(`Back to Image Collections`, <FaFolder />, () => {setSelectedImageFolder(null); setSelectedImages([]);}, 0)}
              <h4 className="font-semibold p-2 text-sky-300">{selectedImageFolder.name} - Select Images:</h4>
              {selectedImageFolder.images.map(img => renderCheckboxItem(img, selectedImages.some(f => f.path === img.path), () => handleImageToggle(img), 1))}
              {selectedImages.length > 0 && (
                <button 
                  onClick={confirmImageSelection} 
                  disabled={disabled}
                  className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:bg-slate-500"
                >
                  Use Selected Images ({selectedImages.length})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
