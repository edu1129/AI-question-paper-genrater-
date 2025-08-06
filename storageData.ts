
import { StorageData } from './types';

// Placeholder base64 for a tiny transparent PNG (1x1)
// For real images, replace this with actual base64 data or use URLs and fetch them.
const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const tinyJpgBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8wP/AAAb/wCP/8AgH/ADCD/wCbM="; // Minimal JPG

export const simulatedStorage: StorageData = {
  classes: [
    {
      name: "Class 10",
      subjects: [
        {
          name: "Mathematics",
          chapters: [
            { 
              name: "Chapter 1 - Real Numbers.pdf", 
              type: 'pdf', 
              path: 'storage/Class 10/Mathematics/Chapter 1 - Real Numbers.pdf', 
              pdfTextContent: "This is the simulated text content for Class 10 Mathematics, Chapter 1: Real Numbers. It covers topics like Euclid's division lemma, fundamental theorem of arithmetic, irrational numbers, and decimal expansions of rational numbers." 
            },
            { 
              name: "Chapter 2 - Polynomials.pdf", 
              type: 'pdf', 
              path: 'storage/Class 10/Mathematics/Chapter 2 - Polynomials.pdf', 
              pdfTextContent: "Simulated content for Class 10 Mathematics, Chapter 2: Polynomials. This includes degree of a polynomial, zeroes of a polynomial, relationship between zeroes and coefficients, and division algorithm for polynomials." 
            },
          ],
        },
        {
          name: "Science",
          chapters: [
            { 
              name: "Chapter 1 - Chemical Reactions and Equations.pdf", 
              type: 'pdf', 
              path: 'storage/Class 10/Science/Chapter 1 - Chemical Reactions.pdf', 
              pdfTextContent: "Simulated text for Class 10 Science, Chapter 1: Chemical Reactions and Equations. Topics include chemical equations, balancing chemical equations, types of chemical reactions (combination, decomposition, displacement, double displacement, oxidation and reduction)." 
            },
             { 
              name: "Chapter 6 - Life Processes.pdf", 
              type: 'pdf', 
              path: 'storage/Class 10/Science/Chapter 6 - Life Processes.pdf', 
              pdfTextContent: "Simulated text for Class 10 Science, Chapter 6: Life Processes. This chapter explores nutrition, respiration, transportation, and excretion in living organisms." 
            },
          ],
        },
      ],
    },
    {
      name: "Class 12",
      subjects: [
        {
          name: "Physics",
          chapters: [
            { 
              name: "Chapter 1 - Electric Charges and Fields.pdf", 
              type: 'pdf', 
              path: 'storage/Class 12/Physics/Chapter 1 - Electric Charges.pdf', 
              pdfTextContent: "Simulated content for Class 12 Physics, Chapter 1: Electric Charges and Fields. Covers electric charge, Coulomb's law, electric field, electric field lines, electric flux, Gauss's law and its applications." 
            },
          ],
        },
        {
          name: "Chemistry",
          chapters: [
            { 
              name: "Chapter 1 - The Solid State.pdf", 
              type: 'pdf', 
              path: 'storage/Class 12/Chemistry/Chapter 1 - The Solid State.pdf', 
              pdfTextContent: "Simulated content for Class 12 Chemistry, Chapter 1: The Solid State. Discusses classification of solids, crystal lattices, unit cells, packing in solids, imperfections in solids, electrical and magnetic properties of solids." 
            },
          ],
        },
      ],
    },
  ],
  imageFolders: [
    {
      name: "Model Question Papers",
      pathPrefix: "storage/model_paper/",
      images: [
        { 
          name: "MQ_Physics_SetA_Page1.png", 
          type: 'image', 
          path: 'storage/model_paper/MQ_Physics_SetA_Page1.png', 
          base64ImageData: tinyPngBase64, 
          mimeType: 'image/png' 
        },
        { 
          name: "MQ_Math_SetB_Diagram.jpg", 
          type: 'image', 
          path: 'storage/model_paper/MQ_Math_SetB_Diagram.jpg', 
          base64ImageData: tinyJpgBase64, 
          mimeType: 'image/jpeg'
        },
      ],
    },
    {
      name: "Previous Year Question Papers",
      pathPrefix: "storage/previous_year_question_paper/",
      images: [
        { 
          name: "PYQ_Chemistry_2023_Q5.png", 
          type: 'image', 
          path: 'storage/previous_year_question_paper/PYQ_Chemistry_2023_Q5.png', 
          base64ImageData: tinyPngBase64, 
          mimeType: 'image/png' 
        },
      ],
    },
  ],
};
