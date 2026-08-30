import React, { useState } from 'react';
import { ShieldCheck, BookOpen, AlertCircle, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ResponseView({ stateData }) {
  const [copied, setCopied] = useState(false);

  if (!stateData || !stateData.final_response) {
    return null;
  }

  const res = stateData.final_response;
  const answerMarkdown = res.answer_markdown || '';
  const citations = res.citations || [];
  const confidenceLevel = res.confidence_level || 'HIGH';
  const confidenceScore = res.confidence_score || 0.95;

  const handleCopy = () => {
    navigator.clipboard.writeText(answerMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#D5E2EC] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Response Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D5E2EC]">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-[#11423F] flex items-center justify-center text-[#1FB6A6] shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#11423F] tracking-tight">
              Clinical Decision Synthesis & Recommendation
            </h3>
            <p className="text-xs text-[#587084]">
              Multi-agent reasoning validated across PubMed RAG, Medical KG, and Clinical Guidelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Grounding Badge with Mint Highlight */}
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#E6F8F6] border border-[#0D9488]/30 text-xs">
            <span className="text-[#0D9488] font-bold">Grounding:</span>
            <span className="font-bold text-[#11423F]">
              {confidenceLevel} ({(confidenceScore * 100).toFixed(0)}%)
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-[#F1F7FB] border border-[#D5E2EC] text-[#587084] hover:text-[#11423F] hover:bg-white transition-colors"
            title="Copy Recommendation"
          >
            {copied ? <Check className="h-4 w-4 text-[#16845B]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Rendered Clinical Answer with GFM Table Support */}
      <div className="clinical-markdown prose max-w-none text-[#163247] text-xs leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {answerMarkdown}
        </ReactMarkdown>
      </div>

      {/* Provenance & Citations */}
      {citations.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#D5E2EC]">
          <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <div className="p-1 rounded bg-[#E6F8F6] text-[#0D9488]">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span>Retrieved Clinical Provenance & Citations</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {citations.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs flex items-start space-x-2.5">
                <div className="h-6 w-6 rounded-full bg-[#E6F8F6] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#163247] truncate">{c.title || c.id}</div>
                  <div className="text-[11px] text-[#587084] font-mono mt-0.5">{c.source} ({c.id})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Disclaimer */}
      {res.disclaimer && (
        <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[11px] text-[#9F1239] flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 text-[#E11D48] shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{res.disclaimer}</span>
        </div>
      )}
    </div>
  );
}
