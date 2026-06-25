import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// // @ts-ignore
// import * as ArabicReshaper from "arabic-persian-reshaper";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadImage(file: File, folder: string) {
  const formData = new FormData()

  formData.append("file", file)
  formData.append("folder", folder)

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("Upload failed")
  }

  const data = await res.json()

  return data.url
}

export async function deleteImage(url: string): Promise<void> {
  const res = await fetch("/api/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Delete failed");
  }
}


// to export to csv
export function exportToCsv(data:any[], filename: string){
  if(!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(field => {
        const value = row[field] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    )
  ];

  const csvString = csvRows.join("\n");
  
  // create a blob & trigger download
  const blob = new Blob(["\ufeff", csvString], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a); 
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}

// export function exportToPdf(
//   title:    string,
//   headers:  string[],
//   rows:     (string | number)[][],
//   filename: string
// ) {
//   const doc = new jsPDF({ orientation: "landscape" });

//   doc.setFontSize(14);
//   doc.text(title, 14, 16);
//   doc.setFontSize(9);
//   doc.setTextColor(130);
//   doc.text(`Generated ${new Date().toLocaleDateString("en-GB")}`, 14, 22);

//   autoTable(doc, {
//     head:       [headers],
//     body:       rows,
//     startY:     28,
//     styles:     { fontSize: 8, cellPadding: 3 },
//     headStyles: { fillColor: [127, 80, 244], textColor: 255, fontStyle: "bold" },
//     alternateRowStyles: { fillColor: [248, 250, 252] },
//   });

//   doc.save(filename);
// }


// export async function exportToPdf(
//   title: string,
//   headers: string[],
//   rows: (string | number)[][],
//   filename: string
// ) {
//   const doc = new jsPDF({ orientation: "landscape" });

//   try {
//     // 1. Fetch the font asset as a clean Blob
//     const response = await fetch("/fonts/Cairo-Regular.ttf");
//     if (!response.ok) throw new Error("Font file not found in public/fonts/");
//     const blob = await response.blob();

//     // 2. Convert Blob to a Base64 DataURL safely using FileReader
//     const base64Font: string = await new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // This strips away the "data:font/ttf;base64," prefix header if present
//         const result = reader.result as string;
//         const base64Clean = result.split(",")[1] || result;
//         resolve(base64Clean);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });

//     // 3. Securely register the static font into jsPDF's VFS
//     doc.addFileToVFS("Cairo.ttf", base64Font);
//     doc.addFont("Cairo.ttf", "Cairo", "normal");
//     doc.setFont("Cairo");
//   } catch (err) {
//     console.error("Could not load Arabic font, falling back to standard font layout", err);
//   }

//   // 4. Helper function to shape and flip Arabic text strings
//  const fixArabicText = (text: any): string => {
//   if (typeof text !== "string") return String(text);
  
//   // 1. Return immediately if there is no Arabic script inside the string
//   const hasArabic = /[\u0600-\u06FF]/.test(text);
//   if (!hasArabic) return text;

//   // 2. Resolve the reshaper function context safely
//   const convertFn = (ArabicReshaper as any).convertArabic || 
//                     (ArabicReshaper as any).default?.convertArabic || 
//                     ArabicReshaper;

//   if (typeof convertFn !== 'function') {
//     return text;
//   }

//   // 3. Split the full address layout safely by space chunks
//   const words = text.split(" ");
  
//   const processedWords = words.map(word => {
//     // If this specific word contains Arabic characters, shape it and reverse its glyphs
//     if (/[\u0600-\u06FF]/.test(word)) {
//       const shaped = convertFn(word);
//       return shaped.split("").reverse().join("");
//     }
//     // If it's an English word or a standalone identification number, leave it untouched
//     return word;
//   });

//   // 4. Reverse the word array sequence globally so it follows the correct PDF RTL visual order
//   return processedWords.reverse().join(" ");
// };

//   const cleanTitle = fixArabicText(title);
//   const cleanHeaders = headers.map(h => fixArabicText(h));
//   const cleanRows = rows.map((row) => row.map(cell =>{
//     return fixArabicText(cell);

//   }));

//   // 5. Print Layout Document Headers
//   doc.setFontSize(14);
//   doc.text(cleanTitle, 14, 16);
//   doc.setFontSize(9);
//   doc.setTextColor(130);
//   doc.text(`Generated ${new Date().toLocaleDateString("en-GB")}`, 14, 22);

//   // 6. Draw Table
//   autoTable(doc, {
//     head: [cleanHeaders],
//     body: cleanRows,
//     startY: 28,
//     styles: { 
//       fontSize: 8, 
//       cellPadding: 3,
//       font: "Cairo" 
//     },
//     headStyles: { fillColor: [127, 80, 244], textColor: 255, fontStyle: "bold" },
//     alternateRowStyles: { fillColor: [248, 250, 252] },
//   });

//   doc.save(filename);
// }