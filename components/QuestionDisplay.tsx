
import React from 'react';
import { QuestionType } from '../types'; 

interface QuestionDisplayProps {
  content: string;
  institutionName: string;
  questionType: QuestionType;
  numQuestions: string;
  showPaperHeader: boolean; // Added prop to control header visibility
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  content, 
  institutionName, 
  questionType, 
  numQuestions,
  showPaperHeader 
}) => {
  return (
    <>
      {showPaperHeader && (
        <>
          <h1>{institutionName}</h1>
          <h2>Question Paper</h2>
          <p style={{textAlign: 'center', fontSize: '0.9em', marginBottom: '15px'}}> {/* Relative font size */}
            <strong>Subject:</strong> Based on Uploaded Chapter | <strong>Type:</strong> {questionType} | <strong>Total Questions:</strong> {numQuestions}
          </p>
        </>
      )}
      <div>{content}</div>
    </>
  );
};