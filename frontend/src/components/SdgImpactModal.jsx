import React from 'react';
import { Globe, HeartPulse, Cpu, Users, Shield, Share2, X, CheckCircle2, Award } from 'lucide-react';

export default function SdgImpactModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const primarySdg = {
    number: 3,
    title: "Good Health and Well-Being",
    role: "PRIMARY DIRECT ALIGNMENT",
    badge: "bg-[#E8F5EE] text-[#16855B] border-[#16855B]/30",
    icon: HeartPulse,
    points: [
      "Supports evidence-based clinical decision-making with multi-source verification.",
      "Improves rapid access to structured medical knowledge for clinicians and care providers.",
      "Aims to reduce unreliable or unsupported AI medical recommendations and adverse drug interactions."
    ]
  };

  const supportingSdgs = [
    {
      number: 9,
      title: "Industry, Innovation and Infrastructure",
      role: "SUPPORTING ALIGNMENT",
      badge: "bg-[#FBF4E4] text-[#8C6200] border-[#C58A00]/30",
      icon: Cpu,
      points: [
        "Develops an innovative AI reasoning infrastructure combining LLMs, RAG, Knowledge Graphs, and dynamic Multi-Agent graphs (ARG).",
        "Promotes sustainable, open technological innovation in healthcare systems."
      ]
    },
    {
      number: 10,
      title: "Reduced Inequalities",
      role: "SUPPORTING ALIGNMENT",
      badge: "bg-[#FCECEE] text-[#C43D4B] border-[#C43D4B]/30",
      icon: Users,
      points: [
        "Democratizes access to high-quality clinical guidance and medical knowledge for resource-constrained clinics.",
        "Reduces knowledge disparities across diverse healthcare settings through an open decision-support interface."
      ]
    },
    {
      number: 16,
      title: "Peace, Justice and Strong Institutions",
      role: "SUPPORTING ALIGNMENT (RESPONSIBLE AI)",
      badge: "bg-[#E8F2FA] text-[#1769AA] border-[#1769AA]/30",
      icon: Shield,
      points: [
        "Fosters transparent, accountable, and evidence-grounded AI in high-stakes clinical domains.",
        "Provides multi-source verification, audit logs, and provenance citations to prevent clinical misinformation."
      ]
    },
    {
      number: 17,
      title: "Partnerships for the Goals",
      role: "SUPPORTING ALIGNMENT (COLLABORATION)",
      badge: "bg-[#E6F4F5] text-[#008C95] border-[#008C95]/30",
      icon: Share2,
      points: [
        "Integrates heterogeneous structured medical datasets and guidelines (SNOMED CT, KDIGO, ADA, WHO, DrugBank).",
        "Enables cross-institutional interoperability for clinical decision systems."
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#DCE4EC] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCE4EC] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#E8F5EE] text-[#16855B] border border-[#16855B]/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172B3A] flex items-center space-x-2">
                <span>UN Sustainable Development Goals (SDGs)</span>
              </h3>
              <p className="text-xs text-[#5A6E82]">
                How MedGraph directly contributes to global healthcare innovation & responsible AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8898AA] hover:text-[#172B3A] hover:bg-[#F0F4F8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary SDG Card */}
        <div className="p-5 rounded-xl bg-[#E8F5EE]/60 border border-[#16855B]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="h-7 w-7 rounded-lg bg-[#16855B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                3
              </span>
              <h4 className="text-sm font-bold text-[#172B3A]">
                SDG {primarySdg.number} — {primarySdg.title}
              </h4>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${primarySdg.badge}`}>
              {primarySdg.role}
            </span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#172B3A]">
            {primarySdg.points.map((p, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-[#16855B] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Supporting SDGs Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#5A6E82] uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="h-4 w-4 text-[#1769AA]" />
            <span>Supporting & Enabling SDGs</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportingSdgs.map((sdg) => {
              return (
                <div
                  key={sdg.number}
                  className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE4EC] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="h-5 w-5 rounded bg-white text-[#172B3A] font-bold text-[11px] flex items-center justify-center border border-[#DCE4EC]">
                          {sdg.number}
                        </span>
                        <h5 className="text-xs font-bold text-[#172B3A] truncate">{sdg.title}</h5>
                      </div>
                    </div>
                    <ul className="space-y-1 text-[11px] text-[#5A6E82]">
                      {sdg.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#8898AA] mt-0.5">•</span>
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border self-start mt-2 ${sdg.badge}`}>
                    SDG {sdg.number} Alignment
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t border-[#DCE4EC] text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#172B3A] text-xs font-bold transition-colors"
          >
            Close SDG Overview
          </button>
        </div>
      </div>
    </div>
  );
}
