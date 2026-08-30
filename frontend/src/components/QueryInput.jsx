import React, { useState } from 'react';
import { Send, Sparkles, Sliders, FileQuestion, CheckCircle2 } from 'lucide-react';

export default function QueryInput({
  query,
  setQuery,
  mode,
  setMode,
  sampleQueries,
  onExecute,
  isLoading
}) {
  const [showSamples, setShowSamples] = useState(true);

  const modes = [
    {
      id: 'adaptive',
      name: 'Adaptive MedGraph (ARG)',
      tag: 'Dynamic Reasoning',
      desc: 'Dynamic DAG reasoning; selectively triggers specialized clinical agents based on query complexity',
      selectedStyle: 'border-[#1FB6A6] bg-[#E6F8F6] ring-1 ring-[#1FB6A6] shadow-xs',
      titleColor: 'text-[#11423F]',
      badgeColor: 'bg-[#1FB6A6] text-white'
    },
    {
      id: 'baseline_fixed_multiagent',
      name: 'Baseline 3: Fixed Multi-Agent',
      tag: 'Static Pipeline',
      desc: 'Executes every single agent (RAG, KG, Safety, Guidelines, Verifier) sequentially without routing',
      selectedStyle: 'border-[#C58A00] bg-[#FBF5E6] ring-1 ring-[#C58A00]',
      titleColor: 'text-[#8C6200]',
      badgeColor: 'bg-[#C58A00] text-white'
    },
    {
      id: 'baseline_rag',
      name: 'Baseline 2: Traditional RAG',
      tag: 'Single-Pass',
      desc: 'Direct vector retrieval from medical literature passed to single LLM prompt without KG reasoning',
      selectedStyle: 'border-[#0878B9] bg-[#E3F2FA] ring-1 ring-[#0878B9]',
      titleColor: 'text-[#0878B9]',
      badgeColor: 'bg-[#0878B9] text-white'
    },
    {
      id: 'baseline_llm',
      name: 'Baseline 1: Direct LLM',
      tag: 'No Retrieval',
      desc: 'Standard LLM generation relying entirely on internal parametric training weights',
      selectedStyle: 'border-[#587084] bg-[#EEF4F8] ring-1 ring-[#587084]',
      titleColor: 'text-[#11423F]',
      badgeColor: 'bg-[#587084] text-white'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onExecute(query, mode);
    }
  };

  return (
    <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Mode Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#11423F] flex items-center space-x-2">
            <div className="p-1 rounded-md bg-[#E6F8F6] text-[#0D9488]">
              <Sliders className="h-3.5 w-3.5" />
            </div>
            <span>Reasoning Architecture & Baseline Mode</span>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {modes.map((m) => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? m.selectedStyle
                    : 'border-[#D5E2EC] bg-white text-[#587084] hover:border-[#1FB6A6]/60 hover:bg-[#F8FCFE]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold ${isSelected ? m.titleColor : 'text-[#163247]'}`}>
                      {m.name}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#1FB6A6]" />}
                  </div>
                  <p className="text-[11px] text-[#587084] line-clamp-2 leading-relaxed">{m.desc}</p>
                </div>
                <span className={`mt-2.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full self-start font-bold ${
                  isSelected ? m.badgeColor : 'bg-[#F1F7FB] border border-[#D5E2EC] text-[#587084]'
                }`}>
                  {m.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="relative pt-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#11423F] flex items-center space-x-2 mb-2">
          <div className="p-1 rounded-md bg-[#FFF1F2] text-[#E11D48]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>Enter Clinical Question / Medication Query</span>
        </label>
        <div className="relative rounded-xl border border-[#D5E2EC] bg-white focus-within:border-[#1FB6A6] focus-within:ring-2 focus-within:ring-[#1FB6A6]/20 transition-all shadow-xs">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?"
            className="w-full bg-transparent px-4 py-3 text-sm text-[#163247] placeholder-[#8898AA] focus:outline-none resize-none font-sans"
          />
          <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#E8F0F5] bg-[#F8FCFE] rounded-b-xl">
            <button
              type="button"
              onClick={() => setShowSamples(!showSamples)}
              className="text-xs text-[#587084] hover:text-[#11423F] flex items-center space-x-1.5 font-bold transition-colors"
            >
              <FileQuestion className="h-4 w-4 text-[#0D9488]" />
              <span>{showSamples ? 'Hide Clinical Scenarios' : 'Show Clinical Scenarios'}</span>
            </button>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#11423F] hover:bg-[#0C3331] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <span>Execute Clinical Query</span>
                  <Send className="h-3.5 w-3.5 text-[#1FB6A6] group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sample Query Scenario Cards */}
      {showSamples && sampleQueries?.length > 0 && (
        <div className="pt-3 border-t border-[#E8F0F5]">
          <span className="text-[11px] font-bold text-[#11423F] uppercase tracking-wide block mb-2">
            Try Pre-Configured Clinical Scenarios:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sampleQueries.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQuery(item.text)}
                className="text-left p-3.5 rounded-xl bg-white hover:bg-[#E6F8F6] border border-[#D5E2EC] hover:border-[#1FB6A6] transition-all group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#163247] group-hover:text-[#11423F]">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F1F7FB] border border-[#D5E2EC] text-[#587084] font-bold">
                    {item.complexity}
                  </span>
                </div>
                <p className="text-[11px] text-[#587084] group-hover:text-[#163247] line-clamp-1 italic">"{item.text}"</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
