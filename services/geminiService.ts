import { GoogleGenAI, Type } from "@google/genai";

/**
 * ⚠️ BẮT BUỘC:
 * File .env phải có:
 * VITE_GEMINI_API_KEY=xxxxxxxxxxxx
 */

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/* =====================================================
   1️⃣ TẠO NỘI DUNG 1 PHẦN
===================================================== */
export const generateSectionContent = async (
  sectionName: string,
  context: string
) => {
  const model = "gemini-1.5-pro"; // model ổn định production

  const prompt = `
Bạn là chuyên gia giáo dục Việt Nam chuyên viết SKKN đạt giải cao.

Hãy viết phần "${sectionName}" cho đề tài:
"${context}"

Yêu cầu:
- Văn phong học thuật, trang trọng.
- Phân tích sâu về lý luận và thực tiễn.
- Có ví dụ minh họa cụ thể.
- Nội dung dài, chi tiết và thuyết phục.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });

    return response.text || "Không thể tạo nội dung.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Lỗi kết nối AI. Vui lòng kiểm tra API KEY.";
  }
};

/* =====================================================
   2️⃣ TẠO TOÀN BỘ BÁO CÁO (Chia nhỏ chống lỗi token)
===================================================== */
export const generateFullReportAI = async (title: string) => {
  const model = "gemini-1.5-pro";

  try {
    // PHẦN I
    const part1 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN I - ĐẶT VẤN ĐỀ cho đề tài: "${title}". Phân tích sâu, dài và học thuật.`
        }]
      }]
    });

    // PHẦN II
    const part2 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN II - NỘI DUNG cho đề tài: "${title}". 
Bao gồm: thực trạng, ít nhất 5 biện pháp (mỗi biện pháp có cơ sở lý luận, cách thực hiện, ví dụ minh họa).`
        }]
      }]
    });

    // PHẦN III
    const part3 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN III - ĐÁNH GIÁ cho đề tài: "${title}". 
Phân tích tính mới, hiệu quả, số liệu minh chứng và khả năng áp dụng.`
        }]
      }]
    });

    // PHẦN IV
    const part4 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN IV - KẾT LUẬN cho đề tài: "${title}". 
Nêu bài học kinh nghiệm và kiến nghị.`
        }]
      }]
    });

    return {
      necessity: part1.text || "",
      solutions: part2.text || "",
      efficiency: part3.text || "",
      conclusion: part4.text || ""
    };

  } catch (error) {
    console.error("Full AI Generation Error:", error);
    throw new Error("Lỗi tạo báo cáo AI.");
  }
};
