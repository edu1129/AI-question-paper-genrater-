
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePdfFromElement = async (elementId: string, fileName: string = 'question-paper.pdf'): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID '${elementId}' not found.`);
    alert(`Error: Preview element not found. Cannot generate PDF.`);
    return;
  }

  try {
    // Get the computed style of the input element to respect its current font size for rendering.
    const computedStyle = window.getComputedStyle(input);
    // const fontSize = computedStyle.fontSize; // e.g., "11pt" // Not directly used here, but good for context

    // Ensure the element's full scrollable dimensions are used for the canvas.
    const canvasWidthPx = input.scrollWidth;
    const canvasHeightPx = input.scrollHeight;

    const canvas = await html2canvas(input, {
      scale: 3, // Increased scale from 2 to 3 for better text quality
      useCORS: true,
      backgroundColor: '#ffffff', // Ensure background is white for the canvas
      logging: false, 
      imageTimeout: 0, // Prevent timeout for potentially longer rendering with higher scale
      width: canvasWidthPx,    // Explicitly set canvas width to the element's scrollWidth
      height: canvasHeightPx,  // Explicitly set canvas height to the element's scrollHeight
      // scrollY: 0, // Not needed if height is explicitly set to scrollHeight
      // scrollX: 0, // Not needed if width is explicitly set to scrollWidth
      windowWidth: canvasWidthPx, // Help html2canvas understand the "viewport" for this element
      windowHeight: canvasHeightPx,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    
    const PADDING = 35; 
    const contentWidthPdf = pdfPageWidth - 2 * PADDING;
    const contentHeightPdf = pdfPageHeight - 2 * PADDING;

    // Canvas dimensions from html2canvas (already scaled by `scale: 3`)
    // The `canvas` object returned by html2canvas has dimensions corresponding to `input.scrollWidth * scale`
    // and `input.scrollHeight * scale`.
    const sourceCanvasWidth = canvas.width; 
    const sourceCanvasHeight = canvas.height;

    // Calculate the ratio to scale the canvas image width to fit the PDF content width
    const widthRatio = contentWidthPdf / sourceCanvasWidth;
    
    // The effective total height of the scaled canvas image if it were placed on the PDF
    // This isn't used directly for slicing, but for conceptual understanding
    // const totalScaledCanvasHeightOnPdf = sourceCanvasHeight * widthRatio;

    let currentYPositionOnSourceCanvas = 0; // Y-offset on the source canvas (pixels on the large canvas)

    while (currentYPositionOnSourceCanvas < sourceCanvasHeight) {
      if (currentYPositionOnSourceCanvas > 0) { // Add new page for subsequent chunks
        pdf.addPage();
      }

      // Calculate the height of the slice to take from the source canvas (in source canvas pixels)
      // This is the amount of canvas content (in source canvas pixels) that corresponds to one PDF page's contentHeightPdf
      let sliceHeightOnSourceCanvas = contentHeightPdf / widthRatio;

      // If the remaining canvas content is less than a full page, take only what's left
      if (currentYPositionOnSourceCanvas + sliceHeightOnSourceCanvas > sourceCanvasHeight) {
        sliceHeightOnSourceCanvas = sourceCanvasHeight - currentYPositionOnSourceCanvas;
      }

      // Create a temporary canvas for the current page's slice
      const pageCanvas = document.createElement('canvas');
      // The temporary canvas dimensions should match the slice dimensions from the source canvas
      pageCanvas.width = sourceCanvasWidth;
      pageCanvas.height = sliceHeightOnSourceCanvas;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        // Draw the slice from the main source canvas onto the temporary page canvas
        pageCtx.drawImage(
          canvas, // Source image (the full html2canvas output)
          0, // Source X
          currentYPositionOnSourceCanvas, // Source Y (where to start slicing from on the main canvas)
          sourceCanvasWidth, // Source Width (full width of the main canvas)
          sliceHeightOnSourceCanvas, // Source Height (height of the slice)
          0, // Destination X on pageCanvas
          0, // Destination Y on pageCanvas
          sourceCanvasWidth, // Destination Width on pageCanvas
          sliceHeightOnSourceCanvas // Destination Height on pageCanvas
        );

        const pageImgData = pageCanvas.toDataURL('image/png');
        // The height of this slice when placed on the PDF
        const actualSliceHeightOnPdf = sliceHeightOnSourceCanvas * widthRatio;

        pdf.addImage(
          pageImgData,
          'PNG',
          PADDING, // X position on PDF page
          PADDING, // Y position on PDF page
          contentWidthPdf, // Width of image on PDF page (should fit contentWidthPdf)
          actualSliceHeightOnPdf // Height of image on PDF page
        );
      } else {
        console.error("Could not get 2D context for page canvas slice.");
        // Fallback: attempt to add a portion of the main canvas directly (less accurate for multi-page)
        // This simplified fallback might have issues if the content is truly multi-page
        const yOffsetForPdfAddImage = - (currentYPositionOnSourceCanvas * widthRatio); // negative offset
        pdf.addImage(imgData, 'PNG', PADDING, PADDING + yOffsetForPdfAddImage, contentWidthPdf, sourceCanvasHeight * widthRatio);
        break; // Exit loop if we can't slice properly
      }
      currentYPositionOnSourceCanvas += sliceHeightOnSourceCanvas;
    }
    
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert(`Failed to generate PDF. See console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};
