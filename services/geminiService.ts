import { GoogleGenAI } from "@google/genai";

/*
⚠️ BẮT BUỘC:
File .env phải có:
VITE_GEMINI_API_KEY=AIzaSyD5pgTmUpZp5qiBxFZ3epXr3jnLHD5HO98
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
  const model = "gemini-1.5-pro";

  const prompt = `
Bạn là chuyên gia giáo dục Việt Nam chuyên viết SKKN đạt giải cao.

Hãy viết nội dung cho phần "${sectionName}" 
của đề tài: "${context}"

Yêu cầu:
- Văn phong học thuật, trang trọng.
- Phân tích sâu lý luận và thực tiễn.
- Có ví dụ minh họa.
- Viết dài, chi tiết, thuyết phục.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }]
    });

    return response.text ?? "Không thể tạo nội dung.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Lỗi kết nối AI. Kiểm tra API KEY.";
  }
};

/* =====================================================
   2️⃣ TẠO TOÀN BỘ BÁO CÁO (CHIA NHỎ ĐỂ KHÔNG LỖI TOKEN)
===================================================== */
export const generateFullReportAI = async (title: string) => {
  const model = "gemini-1.5-pro";

  try {
    // ===== PHẦN I =====
    const part1 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN I - ĐẶT VẤN ĐỀ cho đề tài: "${title}". 
Phân tích sâu sắc, học thuật, chi tiết.`
        }]
      }]
    });

    // ===== PHẦN II =====
    const part2 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN II - NỘI DUNG cho đề tài: "${title}". 
Bao gồm:
- Thực trạng chi tiết
- Ít nhất 5 biện pháp
- Mỗi biện pháp có: cơ sở lý luận, mục đích, cách thực hiện, ví dụ minh họa.`
        }]
      }]
    });

    // ===== PHẦN III =====
    const part3 = await ai.models.generateContent({
      model,
      contents: [{
        parts: [{
          text: `Viết PHẦN III - ĐÁNH GIÁ cho đề tài: "${title}". 
Phân tích:
- Tính mới
- Tính hiệu quả
- Số liệu minh chứng
- Khả năng áp dụng`
        }]
      }]
    });

    // ===== PHẦN IV =====
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
      necessity: part1.text ?? "",
      solutions: part2.text ?? "",
      efficiency: part3.text ?? "",
      conclusion: part4.text ?? ""
    };

  } catch (error) {
    console.error("Full AI Generation Error:", error);
    throw new Error("Không thể tạo báo cáo AI.");
  }
};
