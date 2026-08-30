import React from 'react';
import { GitMerge, CheckCircle, Clock, Zap, Network, ShieldCheck, FileText } from 'lucide-react';

export default function ArgFlowVisualizer({ stateData }) {
  if (!stateData) {
    return (
      <div className="bg-white border border-[#D5E2EC] rounded-2xl p-8 text-center text-[#587084] shadow-sm">
        <GitMerge className="h-10 w-10 mx-auto text-[#8898AA] mb-3" />
        <h3 className="text-sm font-bold text-[#11423F] mb-1">Adaptive Reasoning Graph (ARG) Visualizer</h3>
        <p className="text-xs text-[#587084] max-w-md mx-auto">
          Execute a clinical query to inspect how the Planner Agent dynamically synthesizes and executes a tailored reasoning workflow.
        </p>
      </div>
    );
  }

  const plannerOutput = stateData.planner_output || {};
  const argPlan = plannerOutput.arg_plan || {};
  const activeAgentIds = stateData.active_agent_ids || [];
  const trace = stateData.execution_trace || [];
  const entities = plannerOutput.entities || {};

  // All 7 specialized agent nodes in execution order
  const allNodes = [
    { id: 'planner_agent', step: 1, name: 'Planner Agent', role: 'Workflow Synthesizer', icon: Zap },
    { id: 'retrieval_agent', step: 2, name: 'Medical RAG', role: 'PubMed Literature', icon: FileText },
    { id: 'kg_agent', step: 3, name: 'Knowledge Graph', role: 'Ontology Traversal', icon: Network },
    { id: 'drug_safety_agent', step: 4, name: 'Drug Safety Agent', role: 'DDI & Contraindications', icon: ShieldCheck },
    { id: 'guideline_agent', step: 5, name: 'Guideline Agent', role: 'KDIGO / ADA / WHO', icon: FileText },
    { id: 'verifier_agent', step: 6, name: 'Evidence Verifier', role: 'Multi-Source Audit', icon: ShieldCheck },
    { id: 'response_agent', step: 7, name: 'Response Generator', role: 'Clinical Synthesis', icon: CheckCircle }
  ];

  return (
    <div className="space-y-4">
      {/* ARG Dynamic Plan Header */}
      <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5E2EC]">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#11423F] text-[#1FB6A6] flex items-center justify-center shadow-xs">
                <GitMerge className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#11423F] uppercase tracking-wide">
                Runtime Adaptive Reasoning Graph (ARG)
              </h3>
            </div>
            <p className="text-xs text-[#587084] mt-0.5">
              Query-specific workflow dynamically synthesized by the Planner Agent
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Complexity Indicator */}
            <div className="flex items-center space-x-1.5 bg-[#11423F] text-white px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="text-[#B0D5D2] font-semibold text-[11px]">Complexity:</span>
              <span className="font-bold text-[#1FB6A6] font-mono">
                {plannerOutput.complexity_score ? `${plannerOutput.complexity_score}/5` : 'N/A'}
              </span>
              <span className="text-[10px] text-white/80">({plannerOutput.complexity_level || 'Custom'})</span>
            </div>

            {/* Total Latency */}
            <div className="flex items-center space-x-1.5 bg-[#F1F7FB] px-3 py-1.5 rounded-full border border-[#D5E2EC]">
              <Clock className="h-3.5 w-3.5 text-[#587084]" />
              <span className="text-[#587084] font-medium text-[11px]">Latency:</span>
              <span className="font-mono text-[#11423F] font-bold">{stateData.total_latency_ms || 0} ms</span>
            </div>

            {/* Agents Invoked */}
            <div className="flex items-center space-x-1.5 bg-[#E6F8F6] px-3 py-1.5 rounded-full border border-[#0D9488]/30">
              <span className="text-[#0D9488] font-semibold text-[11px]">Activated:</span>
              <span className="font-mono text-[#11423F] font-bold">{stateData.agents_invoked_count || activeAgentIds.length} / 7</span>
            </div>
          </div>
        </div>

        {/* Dynamic Planner Rationale */}
        {argPlan.rationale && (
          <div className="p-3.5 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs">
            <span className="font-bold text-[#11423F]">Planner Rationale: </span>
            <span className="text-[#163247] leading-relaxed">{argPlan.rationale}</span>
          </div>
        )}

        {/* Extracted Clinical Entities */}
        {entities && Object.values(entities).some(arr => arr?.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-[11px] font-bold text-[#11423F] uppercase mr-1">Extracted Entities:</span>
            {entities.drugs?.map((d) => (
              <span key={d} className="px-2.5 py-0.5 rounded-full bg-[#E6F8F6] border border-[#0D9488]/30 text-[#0D9488] text-[11px] font-bold">
                💊 {d}
              </span>
            ))}
            {entities.diseases?.map((d) => (
              <span key={d} className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-[11px] font-bold">
                🩺 {d}
              </span>
            ))}
            {entities.symptoms?.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#FBF5E6] border border-[#C58A00]/30 text-[#8C6200] text-[11px] font-bold">
                🌡️ {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Graph Nodes & Pipeline Flow Visualizer - Spacious Grid Layout */}
      <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider mb-2 flex items-center space-x-2">
          <div className="p-1 rounded-md bg-[#E6F8F6] text-[#0D9488]">
            <Network className="h-3.5 w-3.5" />
          </div>
          <span>Workflow Execution Topology (Activated vs Pruned)</span>
        </h4>

        {/* Spacious multi-row grid so text and badges are never crushed or overlapped */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {allNodes.map((node) => {
            const isActive = activeAgentIds.includes(node.id) || stateData.mode === 'baseline_fixed_multiagent';
            const Icon = node.icon;
            const traceItem = trace.find(t => t.agent_id === node.id || t.agent_name.toLowerCase().includes(node.name.toLowerCase()));

            return (
              <div
                key={node.id}
                className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between min-h-[160px] ${
                  isActive
                    ? 'border-[#1FB6A6] bg-[#F2FAF9] shadow-xs ring-1 ring-[#1FB6A6]/30'
                    : 'border-[#D5E2EC] bg-[#F8FCFE] opacity-50'
                }`}
              >
                <div>
                  {/* Top Bar with Step Badge, Icon & Status Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center ${
                        isActive ? 'bg-[#11423F] text-[#1FB6A6] shadow-xs' : 'bg-[#EAF1F5] text-[#8898AA]'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] whitespace-nowrap">
                        Step {node.step}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                      isActive ? 'bg-[#E6F8F6] border border-[#0D9488]/30 text-[#0D9488]' : 'bg-[#EAF1F5] text-[#8898AA]'
                    }`}>
                      {isActive ? 'ACTIVE' : 'PRUNED'}
                    </span>
                  </div>

                  {/* Agent Name & Role */}
                  <h5 className="text-xs font-bold text-[#11423F]">{node.name}</h5>
                  <span className="text-[10px] text-[#587084] font-medium block">{node.role}</span>

                  {/* Execution Summary */}
                  <p className="text-[11px] text-[#163247] mt-2 leading-relaxed">
                    {traceItem?.summary || (isActive ? 'Executed in dynamic DAG' : 'Pruned by Planner for efficiency')}
                  </p>
                </div>

                {/* Footer with Latency */}
                {isActive && traceItem && (
                  <div className="mt-3.5 pt-2.5 border-t border-[#D5E2EC]/70 text-[11px] flex items-center justify-between gap-2 text-[#587084]">
                    <span className="whitespace-nowrap font-medium">Latency</span>
                    <span className="text-[#11423F] font-bold font-mono bg-white px-2.5 py-0.5 rounded-full border border-[#D5E2EC] whitespace-nowrap">
                      {traceItem.latency_ms} ms
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step-by-Step Telemetry Trace */}
      <div className="bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider">
          Step-by-Step Agent Telemetry Trace
        </h4>
        <div className="divide-y divide-[#E8F0F5]">
          {trace.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between text-xs gap-3">
              <div className="flex items-start space-x-2.5">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#1FB6A6] shrink-0"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#11423F]">{item.agent_name}</span>
                    <span className="text-[10px] text-[#587084] font-mono px-2 py-0.5 rounded-full bg-[#F1F7FB] border border-[#D5E2EC]">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-[#587084] text-[11px] mt-0.5">{item.summary}</p>
                </div>
              </div>
              <div className="font-mono text-[11px] text-[#11423F] font-bold whitespace-nowrap bg-[#F1F7FB] px-2 py-0.5 rounded-full border border-[#D5E2EC]">
                {item.latency_ms} ms
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
