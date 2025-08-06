
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs-dist
try {
  if (pdfjsLib && pdfjsLib.version) {
    // Attempt to use the dynamically determined version from the imported library
    // pdfjs-dist versions on esm.sh for workers are typically like /vX.Y.ZZZ/build/pdf.worker.min.js
    // The library version itself might be X.Y.ZZZ.
    // It seems esm.sh might use different versioning for the main lib vs its assets.
    // Let's try a known stable version that matches the pattern observed for workers on esm.sh
    // The import map specifies pdfjs-dist@^5.3.31, which seems to resolve to 4.x versions.
    // A common stable worker version is 4.4.168.
     pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
    // console.log(`Using PDF.js worker: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
  } else {
    console.warn('pdfjsLib.version is not available. Using a fallback PDF worker path.');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
  }
} catch (error) {
  console.error("Error setting PDF.js worker source:", error);
  // Fallback if any error occurs during version detection or setting
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);