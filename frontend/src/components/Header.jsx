import React from 'react';
import { Activity, GitMerge, Database, BarChart3, Stethoscope, Cpu, ShieldCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, healthInfo }) {
  const tabs = [
    { id: 'consultation', label: 'Clinical Consultation', icon: Stethoscope },
    { id: 'arg_flow', label: 'Dynamic ARG Graph', icon: GitMerge },
    { id: 'evidence', label: 'Evidence Matrix', icon: ShieldCheck },
    { id: 'kg_explorer', label: 'Knowledge Graph', icon: Database },
    { id: 'benchmark', label: 'Benchmark Suite', icon: BarChart3 }
  ];

  return (
    <header className="border-b border-[#D5E2EC] bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-[#11423F] flex items-center justify-center text-[#1FB6A6] shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-[#11423F] leading-none">
                  MedGraph
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#E6F8F6] text-[#0D9488] border border-[#0D9488]/20 whitespace-nowrap">
                  Adaptive Reasoning Graph
                </span>
              </div>
              <p className="text-[11px] text-[#587084] mt-1 font-medium leading-none">
                Clinical Decision Support System
              </p>
            </div>
          </div>

          {/* Navigation Pill Capsule (Inspired by Reference Design) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#11423F] p-1.5 rounded-full shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1FB6A6] text-white shadow-xs'
                      : 'text-[#B0D5D2] hover:text-white hover:bg-[#1B5B57]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Model Status Pill */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-2 bg-[#F1F7FB] px-3 py-1.5 rounded-full border border-[#D5E2EC] text-xs">
              <div className="h-2 w-2 rounded-full bg-[#1FB6A6] animate-pulse"></div>
              <Cpu className="h-3.5 w-3.5 text-[#11423F]" />
              <span className="font-mono text-[#11423F] text-[11px] font-bold">
                {healthInfo?.llm_model || 'openai/gpt-oss-120b'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden overflow-x-auto space-x-1.5 pb-2.5 pt-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-bold ${
                  isActive
                    ? 'bg-[#1FB6A6] text-white'
                    : 'bg-[#11423F] text-[#B0D5D2]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
