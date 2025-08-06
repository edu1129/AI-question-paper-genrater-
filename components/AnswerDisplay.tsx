
import React from 'react';

interface AnswerDisplayProps {
  content: string;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ content }) => {
  if (!content && content.trim() === "") {
    return <p className="text-sm text-slate-400 italic">No answers to display yet, or AI did not provide answers.</p>;
  }

  return (
    <div 
      className="p-3 bg-slate-800 rounded-md shadow custom-scrollbar overflow-y-auto max-h-60" // max-h-60 or adjust as needed
      aria-live="polite"
    >
      {/* Add an ID here for MathJax to target */}
      <pre id="answer-content-area" className="whitespace-pre-wrap text-sm text-gray-300 break-words">{content}</pre>
    </div>
  );
};
