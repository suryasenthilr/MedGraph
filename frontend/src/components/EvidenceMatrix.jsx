import React, { useState } from 'react';
import { ShieldCheck, Database, AlertTriangle, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export default function EvidenceMatrix({ stateData }) {
  const [activeTab, setActiveTab] = useState('verifier');

  if (!stateData) {
    return (
      <div className="bg-white border border-[#D5E2EC] rounded-2xl p-8 text-center text-[#587084] shadow-sm">
        <ShieldCheck className="h-10 w-10 mx-auto text-[#8898AA] mb-3" />
        <h3 className="text-sm font-bold text-[#11423F] mb-1">Multi-Source Evidence Matrix</h3>
        <p className="text-xs text-[#587084] max-w-md mx-auto">
          Execute a query to inspect the cross-source evidence gathered across PubMed Literature, Knowledge Graph, Drug Safety, and Clinical Guidelines.
        </p>
      </div>
    );
  }

  const verifier = stateData.verifier_output || {};
  const kgData = stateData.kg_output || {};
  const safety = stateData.drug_safety_output || {};
  const guidelines = stateData.guideline_output || {};
  const retrieval = stateData.retrieval_output || {};

  const tabs = [
    { id: 'verifier', label: 'Verification Audit', icon: ShieldCheck, badge: verifier.confidence_level || 'N/A' },
    { id: 'kg', label: 'Knowledge Graph Facts', icon: Database, badge: (kgData.interactions?.length || 0) + (kgData.contraindications?.length || 0) },
    { id: 'safety', label: 'Drug Safety Alerts', icon: AlertTriangle, badge: safety.safety_alerts?.length || 0 },
    { id: 'guidelines', label: 'Clinical Guidelines', icon: BookOpen, badge: guidelines.recommendations?.length || 0 },
    { id: 'pubmed', label: 'PubMed RAG Literature', icon: FileText, badge: retrieval.documents?.length || 0 }
  ];

  return (
    <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-4">
      {/* Evidence Navigation Tabs with Pill Design */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#D5E2EC] pb-3.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#11423F] text-white shadow-xs'
                  : 'bg-[#F1F7FB] text-[#587084] hover:text-[#11423F] hover:bg-[#E2EDF5]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#1FB6A6]' : 'text-[#587084]'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#1FB6A6] text-white' : 'bg-white text-[#587084] border border-[#D5E2EC]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {/* 1. Verification Audit */}
        {activeTab === 'verifier' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#E6F8F6] p-3.5 rounded-xl border border-[#0D9488]/30">
                <span className="text-[11px] text-[#0D9488] uppercase font-bold">Confidence</span>
                <div className="text-base font-bold text-[#11423F] mt-1">{verifier.confidence_level || 'HIGH'}</div>
              </div>
              <div className="bg-[#E3F2FA] p-3.5 rounded-xl border border-[#0878B9]/30">
                <span className="text-[11px] text-[#0878B9] uppercase font-bold">Grounding Score</span>
                <div className="text-base font-bold text-[#11423F] mt-1">
                  {verifier.grounding_score ? `${(verifier.grounding_score * 100).toFixed(0)}%` : '95%'}
                </div>
              </div>
              <div className="bg-[#FFF1F2] p-3.5 rounded-xl border border-[#FECDD3]">
                <span className="text-[11px] text-[#E11D48] uppercase font-bold">Conflict Audit</span>
                <div className="text-base font-bold text-[#9F1239] mt-1">
                  {verifier.conflicts_detected?.length ? 'Safety Conflict Flagged' : 'All Sources Concordant'}
                </div>
              </div>
            </div>

            {/* Supporting Evidence Agreements */}
            {verifier.supporting_evidence?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#11423F] uppercase tracking-wide">
                  Cross-Source Concordance & Alignments
                </h5>
                {verifier.supporting_evidence.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#E8F6F0] border border-[#16845B]/30 text-xs">
                    <div className="flex items-center space-x-2 text-[#16845B] font-bold mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{item.source_a} ⟷ {item.source_b}</span>
                    </div>
                    <p className="text-[#163247] text-[11px] leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Safety Conflicts with Coral Pink Highlight */}
            {verifier.conflicts_detected?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#E11D48] uppercase tracking-wide">
                  Safety Conflicts & Clinical Contraindications
                </h5>
                {verifier.conflicts_detected.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs">
                    <div className="flex items-center space-x-2 text-[#E11D48] font-bold mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{c.type}</span>
                    </div>
                    <p className="text-[#9F1239] text-[11px] font-medium leading-relaxed">{c.description}</p>
                    <div className="mt-2 text-[11px] text-[#11423F] font-bold bg-white p-2 rounded-lg border border-[#FECDD3]">
                      <span className="text-[#E11D48]">Resolution: </span>{c.resolution}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Knowledge Graph Triples */}
        {activeTab === 'kg' && (
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#11423F] uppercase tracking-wide">
              Structured Knowledge Graph Relationships
            </h5>
            {kgData.interactions?.length === 0 && kgData.contraindications?.length === 0 && (
              <p className="text-xs text-[#587084] italic">No direct KG interaction triples for this query.</p>
            )}

            {kgData.interactions?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#0878B9]">
                    💊 {item.drug_1} ──[INTERACTS_WITH]──▶ 💊 {item.drug_2}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                    {item.severity}
                  </span>
                </div>
                <p className="text-[#587084] text-[11px] leading-relaxed">{item.description}</p>
              </div>
            ))}

            {kgData.contraindications?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[#E11D48]">
                    💊 {item.drug} ──[CONTRAINDICATED_IN]──▶ 🩺 {item.disease}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                    {item.severity}
                  </span>
                </div>
                <p className="text-[#587084] text-[11px] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* 3. Drug Safety Specialist */}
        {activeTab === 'safety' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#11423F] text-white text-xs">
              <span className="font-bold text-white">Overall Pharmacovigilance Risk:</span>
              <span className={`px-3 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                safety.overall_risk_level === 'CRITICAL' ? 'bg-[#E11D48] text-white' : 'bg-[#1FB6A6] text-white'
              }`}>
                {safety.overall_risk_level || 'LOW'}
              </span>
            </div>

            {safety.safety_alerts?.map((alert, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#C58A00]">{alert.title}</span>
                  <span className="text-[10px] font-mono font-bold text-[#587084] bg-white px-2 py-0.5 rounded-full border border-[#D5E2EC]">{alert.severity}</span>
                </div>
                <p className="text-[#587084] text-[11px] mb-2">{alert.description}</p>
                <div className="text-[11px] text-[#11423F] font-bold bg-[#E6F8F6] p-2 rounded-lg border border-[#0D9488]/30">
                  Required Action: <span className="text-[#163247] font-medium">{alert.action}</span>
                </div>
              </div>
            ))}

            {safety.safe_alternatives?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#D5E2EC]">
                <h5 className="text-xs font-bold text-[#0D9488] uppercase tracking-wide mb-2 flex items-center space-x-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#0D9488]"></div>
                  <span>Recommended Safe Therapeutic Alternatives</span>
                </h5>
                {safety.safe_alternatives.map((alt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#E6F8F6] border border-[#0D9488]/40 text-xs">
                    <div className="font-bold text-[#0D9488] text-xs">{alt.drug} (Max Dose: {alt.max_dose})</div>
                    <p className="text-[#163247] text-[11px] mt-1 font-medium">{alt.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Clinical Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="space-y-3">
            {guidelines.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11423F] text-xs">{rec.organization} ({rec.code})</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2FA] text-[#0878B9] border border-[#0878B9]/30 text-[10px] font-mono font-bold">
                    {rec.evidence_grade}
                  </span>
                </div>
                <div className="text-[11px] text-[#587084] italic font-medium">{rec.guideline_title}</div>
                <p className="text-[#163247] text-xs leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 5. PubMed Literature */}
        {activeTab === 'pubmed' && (
          <div className="space-y-3">
            {retrieval.documents?.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11423F] text-xs">{doc.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8F6F0] text-[#16845B] border border-[#16845B]/30 text-[10px] font-mono font-bold">
                    {doc.id}
                  </span>
                </div>
                <div className="text-[11px] text-[#587084] font-medium">{doc.source} ({doc.year})</div>
                <p className="text-[#163247] text-[11px] leading-relaxed line-clamp-3">{doc.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
