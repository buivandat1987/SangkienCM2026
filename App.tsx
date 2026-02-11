
import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  FileCode,
  UserCircle
} from 'lucide-react';
import { ReportData, ActiveSection } from './types';
import { FormField } from './components/FormField';
import { SectionHeader } from './components/SectionHeader';
import { ReportPreview } from './components/ReportPreview';
import { generateSectionContent, generateFullReportAI } from './services/geminiService';
import { exportToWord } from './services/wordExportService';

const INITIAL_DATA: ReportData = {
  day: new Date().getDate().toString(),
  month: (new Date().getMonth() + 1).toString(),
  year: new Date().getFullYear().toString(),
  title: '',
  author: '',
  unit: '',
  collaborators: '',
  startDate: '',
  endDate: '',
  problemStatement: {
    initiativeName: '',
    necessity: '',
  },
  content: {
    status: {
      advantages: '',
      disadvantages: '',
    },
    causes: '',
    solutions: '',
  },
  evaluation: {
    novelty: '',
    efficiency: '',
    scope: '',
  },
  conclusion: '',
};

const SECTIONS: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
  { id: 'info', label: 'Thông tin chung', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'problem', label: 'Đặt vấn đề', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'content', label: 'Thực trạng', icon: <FileText className="w-4 h-4" /> },
  { id: 'evaluation', label: 'Giải pháp', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'conclusion', label: 'Đánh giá & KL', icon: <CheckCircle2 className="w-4 h-4" /> },
];

export default function App() {
  const [data, setData] = useState<ReportData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<ActiveSection>('info');
  const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null);
  const [isFullGenerating, setIsFullGenerating] = useState(false);

  const handleUpdate = (path: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFullAIGeneration = async () => {
    if (!data.title || data.title.trim().length < 5) {
      alert("Vui lòng nhập tên sáng kiến đầy đủ.");
      return;
    }

    try {
      setIsFullGenerating(true);
      const result = await generateFullReportAI(data.title);
      
      setData(prev => ({
        ...prev,
        problemStatement: { 
          ...prev.problemStatement, 
          initiativeName: data.title, 
          necessity: result.necessity 
        },
        content: {
          ...prev.content,
          status: { advantages: result.advantages, disadvantages: result.disadvantages },
          causes: result.causes,
          solutions: result.solutions
        },
        evaluation: {
          ...prev.evaluation,
          novelty: result.novelty,
          efficiency: result.efficiency,
          scope: result.scope
        },
        conclusion: result.conclusion
      }));

      setTimeout(() => {
        setActiveTab('problem');
        alert("🎉 AI đã soạn thảo xong bản thảo chi tiết! Hãy kiểm tra từng phần để tinh chỉnh nhé.");
      }, 500);
    } catch (error) {
      alert("Lỗi AI. Vui lòng thử lại.");
    } finally {
      setIsFullGenerating(false);
    }
  };

  const handleSingleAIGenerate = async (section: string, field: string) => {
    if (!data.title) {
      alert("Vui lòng điền tên sáng kiến trước.");
      return;
    }
    setIsGeneratingField(field);
    const content = await generateSectionContent(section, data.title);
    handleUpdate(field, content);
    setIsGeneratingField(null);
  };

  const handlePrint = () => window.print();

  const handleExportWord = async () => {
    try {
      await exportToWord(data);
    } catch (error) {
      alert("Lỗi xuất file. Hãy thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f3]">
      {/* AI Loading Overlay */}
      {isFullGenerating && (
        <div className="fixed inset-0 bg-emerald-950/95 backdrop-blur-lg z-[100] flex flex-col items-center justify-center text-white p-8">
          <BrainCircuit className="w-20 h-20 text-emerald-400 mb-6 animate-pulse" />
          <h2 className="text-4xl font-black mb-4">Đang soạn thảo </h2>
          <p className="text-emerald-200/80 max-w-lg text-center text-lg leading-relaxed">
            Được phát triển bởi: BÙI VĂN ĐẠT
          </p>
          <div className="mt-12 w-80 bg-emerald-900 h-3 rounded-full overflow-hidden shadow-inner">
            <div className="bg-emerald-400 h-full animate-[loading_25s_linear_infinite]"></div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="no-print bg-[#1a4d44] text-white shadow-xl px-8 py-5 sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">SÁNG KIẾN KINH GNIỆM <span className="text-emerald-400">4.0</span></h1>
              <p className="text-xs text-emerald-200/60 font-medium uppercase tracking-widest">Hỗ trợ giáo viên sáng tạo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleExportWord} className="flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all border border-emerald-600/50">
              <FileCode className="w-4 h-4" /> Xuất Word
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-400 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/40 transition-all active:scale-95">
              <Printer className="w-4 h-4" /> In nhanh
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex max-w-[1700px] mx-auto w-full overflow-hidden shadow-2xl my-4 rounded-3xl bg-white border border-slate-200">
        {/* Navigation Sidebar */}
        <aside className="no-print w-72 flex-shrink-0 p-8 border-r bg-slate-50 flex flex-col">
          <div className="flex-1 space-y-3">
            <p className="text-[11pt] font-black text-slate-400 uppercase tracking-widest mb-6">Danh mục nội dung</p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11pt] font-bold transition-all ${
                  activeTab === s.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-xs text-emerald-700 font-bold mb-2">Chú ý:</p>
            <p className="text-[10pt] text-emerald-800 leading-snug">Sáng kiến chỉ mang tính chất tham khảo, thầy cô không nên lạm dụng.</p>
          </div>
        </aside>

        {/* Content Editor */}
        <div className="no-print flex-1 overflow-y-auto p-12 bg-white">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'info' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <SectionHeader title="Thông tin định danh sáng kiến" description="Nhập thông tin xuất hiện ở đầu trang 1 của báo cáo." />
                <FormField 
                  label="Tên sáng kiến kinh nghiệm" 
                  value={data.title} 
                  onChange={(v) => handleUpdate('title', v)} 
                  placeholder="Ví dụ: Nâng cao năng lực đọc hiểu cho học sinh lớp 3 qua phương pháp thảo luận nhóm..." 
                />
                
                {data.title.length >= 8 && (
                  <button
                    onClick={handleFullAIGeneration}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
                  >
                    <Sparkles className="w-6 h-6" /> TỰ ĐỘNG SOẠN THẢO 
                  </button>
                )}

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                  <FormField label="Họ và tên người thực hiện" value={data.author} onChange={(v) => handleUpdate('author', v)} />
                  <FormField label="Đơn vị công tác" value={data.unit} onChange={(v) => handleUpdate('unit', v)} />
                </div>
                <FormField label="Cá nhân/Tổ chức phối hợp" value={data.collaborators} onChange={(v) => handleUpdate('collaborators', v)} placeholder="Nếu không có hãy bỏ trống hoặc ghi 'Không'" />
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Triển khai từ ngày" value={data.startDate} onChange={(v) => handleUpdate('startDate', v)} placeholder="Ví dụ: 05/09/2025" />
                  <FormField label="Đến ngày" value={data.endDate} onChange={(v) => handleUpdate('endDate', v)} placeholder="Ví dụ: 25/05/2026" />
                </div>
              </div>
            )}

            {activeTab === 'problem' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <SectionHeader title="I. Đặt vấn đề" description="Lý giải nguyên nhân, mục đích và tầm quan trọng của đề tài." />
                <FormField 
                  label="Lý do chọn đề tài" 
                  type="textarea"
                  value={data.problemStatement.necessity} 
                  onChange={(v) => handleUpdate('problemStatement.necessity', v)} 
                  onAIGenerate={() => handleSingleAIGenerate("Phần đặt vấn đề cực kỳ sâu sắc và học thuật", "problemStatement.necessity")}
                  isGenerating={isGeneratingField === 'problemStatement.necessity'}
                />
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <SectionHeader title="II. Thực trạng & Nguyên nhân" description="Phân tích tình hình thực tế tại đơn vị trước khi thực hiện." />
                <FormField label="Thuận lợi" type="textarea" value={data.content.status.advantages} onChange={(v) => handleUpdate('content.status.advantages', v)} />
                <FormField label="Khó khăn" type="textarea" value={data.content.status.disadvantages} onChange={(v) => handleUpdate('content.status.disadvantages', v)} />
                <FormField label="Nguyên nhân & Hạn chế" type="textarea" value={data.content.causes} onChange={(v) => handleUpdate('content.causes', v)} />
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <SectionHeader title="II. Các biện pháp thực hiện" description="Mô tả chi tiết các bước tiến hành giải pháp (Phần quan trọng nhất)." />
                <FormField 
                  label="Nội dung các biện pháp (Cần mô tả tỉ mỉ)" 
                  type="textarea"
                  value={data.content.solutions} 
                  onChange={(v) => handleUpdate('content.solutions', v)} 
                  onAIGenerate={() => handleSingleAIGenerate("Mô tả hệ thống 5-7 biện pháp sư phạm chi tiết", "content.solutions")}
                  isGenerating={isGeneratingField === 'content.solutions'}
                />
              </div>
            )}

            {activeTab === 'conclusion' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <SectionHeader title="III & IV. Đánh giá & Kết luận" />
                <FormField label="Tính mới, hiệu quả & khả thi" type="textarea" value={data.evaluation.efficiency} onChange={(v) => handleUpdate('evaluation.efficiency', v)} />
                <FormField label="Nội dung kết luận & đề xuất" type="textarea" value={data.conclusion} onChange={(v) => handleUpdate('conclusion', v)} />
              </div>
            )}

            <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-100">
              <button
                disabled={activeTab === 'info'}
                onClick={() => setActiveTab(SECTIONS[SECTIONS.findIndex(s => s.id === activeTab)-1].id)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black text-slate-400 hover:bg-slate-50 disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-5 h-5" /> QUAY LẠI
              </button>
              <button
                disabled={activeTab === 'conclusion'}
                onClick={() => setActiveTab(SECTIONS[SECTIONS.findIndex(s => s.id === activeTab)+1].id)}
                className="bg-emerald-50 text-emerald-700 px-10 py-4 rounded-2xl text-sm font-black hover:bg-emerald-100 transition-all"
              >
                TIẾP THEO <ChevronRight className="w-5 h-5 ml-2 inline" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time A4 Multi-page Preview */}
        <div className="hidden 2xl:block w-[550px] flex-shrink-0 no-print border-l bg-[#d1d9e0] overflow-hidden">
          <div className="h-full scale-[0.45] origin-top transform-gpu -mb-[120%]">
            <ReportPreview data={data} />
          </div>
        </div>
      </main>

      {/* Hidden Print Area */}
      <div className="hidden print:block">
        <ReportPreview data={data} />
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
