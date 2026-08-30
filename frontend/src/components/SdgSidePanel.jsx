import React, { useState } from 'react';
import { Globe, HeartPulse, Cpu, Users, Shield, Share2, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';

export default function SdgSidePanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header with Dark Contrast Icon */}
      <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-full bg-[#11423F] text-[#1FB6A6] flex items-center justify-center shadow-xs">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider">
              UN SDGs Alignment
            </h4>
            <p className="text-[11px] text-[#587084]">Global Sustainability Impact</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#587084] hover:text-[#11423F] p-1 rounded-lg hover:bg-[#F1F7FB] transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3.5 pt-1 animate-fadeIn">
          {/* Primary SDG 3 Card with Dark Pine Surface & Coral Highlight */}
          <div className="p-4 rounded-xl bg-[#11423F] text-white space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-[#E11D48] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  3
                </div>
                <span className="text-xs font-bold text-white">Good Health & Well-Being</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1FB6A6] text-white">
                PRIMARY
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#D1E8E6]">
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1FB6A6] shrink-0 mt-0.5" />
                <span>Evidence-based clinical decision support.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1FB6A6] shrink-0 mt-0.5" />
                <span>Rapid access to structured medical ontologies.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1FB6A6] shrink-0 mt-0.5" />
                <span>Mitigates adverse drug-drug interactions.</span>
              </li>
            </ul>
          </div>

          {/* Supporting SDGs with Coral/Mint/Blue circular badges */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-[#587084] uppercase tracking-wider block">
              Supporting & Enabling SDGs:
            </span>

            {/* SDG 9 */}
            <div className="p-3 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] hover:border-[#1FB6A6] transition-colors space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-[#FFF1F2] text-[#E11D48] font-bold text-[10px] flex items-center justify-center border border-[#FECDD3]">
                    9
                  </div>
                  <span className="text-xs font-bold text-[#11423F]">Industry & AI Innovation</span>
                </div>
                <span className="text-[9px] font-bold text-[#E11D48] bg-[#FFF1F2] px-1.5 py-0.2 rounded-full">
                  AI Architecture
                </span>
              </div>
              <p className="text-[11px] text-[#587084] leading-snug">
                Adaptive multi-agent reasoning architecture combining LLMs, RAG, and Knowledge Graphs.
              </p>
            </div>

            {/* SDG 10 */}
            <div className="p-3 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] hover:border-[#1FB6A6] transition-colors space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-[#E6F8F6] text-[#0D9488] font-bold text-[10px] flex items-center justify-center border border-[#99F6E4]">
                    10
                  </div>
                  <span className="text-xs font-bold text-[#11423F]">Reduced Inequalities</span>
                </div>
                <span className="text-[9px] font-bold text-[#0D9488] bg-[#E6F8F6] px-1.5 py-0.2 rounded-full">
                  Access
                </span>
              </div>
              <p className="text-[11px] text-[#587084] leading-snug">
                Democratizes high-tier clinical decision support across resource-limited clinics.
              </p>
            </div>

            {/* SDG 16 */}
            <div className="p-3 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] hover:border-[#1FB6A6] transition-colors space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-[#E3F2FA] text-[#0878B9] font-bold text-[10px] flex items-center justify-center border border-[#BAE6FD]">
                    16
                  </div>
                  <span className="text-xs font-bold text-[#11423F]">Accountable Institutions</span>
                </div>
                <span className="text-[9px] font-bold text-[#0878B9] bg-[#E3F2FA] px-1.5 py-0.2 rounded-full">
                  Transparency
                </span>
              </div>
              <p className="text-[11px] text-[#587084] leading-snug">
                Transparent, accountable, evidence-grounded AI with full provenance audit trails.
              </p>
            </div>

            {/* SDG 17 */}
            <div className="p-3 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] hover:border-[#1FB6A6] transition-colors space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-[#F3E8FF] text-[#9333EA] font-bold text-[10px] flex items-center justify-center border border-[#E9D5FF]">
                    17
                  </div>
                  <span className="text-xs font-bold text-[#11423F]">Partnerships for Goals</span>
                </div>
                <span className="text-[9px] font-bold text-[#9333EA] bg-[#F3E8FF] px-1.5 py-0.2 rounded-full">
                  Ontologies
                </span>
              </div>
              <p className="text-[11px] text-[#587084] leading-snug">
                Harmonizes open clinical datasets & guidelines (SNOMED, WHO, KDIGO, DrugBank).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
