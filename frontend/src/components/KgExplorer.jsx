import React, { useState, useEffect } from 'react';
import { Database, Search, Share2, RefreshCw } from 'lucide-react';
import { fetchKgStats, fetchKgGraph } from '../services/api';

export default function KgExplorer() {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const [s, g] = await Promise.all([fetchKgStats(), fetchKgGraph()]);
      setStats(s);
      setGraphData(g);
      if (g.nodes?.length > 0) {
        setSelectedNode(g.nodes[0]);
      }
    } catch (err) {
      console.error("Failed to load KG:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const types = ['ALL', 'Drug', 'Disease', 'Symptom', 'LabTest'];

  const filteredNodes = graphData.nodes?.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) || node.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || node.type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const nodeEdges = selectedNode
    ? graphData.edges?.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  const getNodeBadgeColor = (type) => {
    switch (type) {
      case 'Drug': return 'bg-[#E6F8F6] text-[#0D9488] border-[#99F6E4]';
      case 'Disease': return 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]';
      case 'Symptom': return 'bg-[#FBF5E6] text-[#8C6200] border-[#C58A00]/30';
      case 'LabTest': return 'bg-[#E3F2FA] text-[#0878B9] border-[#0878B9]/30';
      default: return 'bg-[#F1F7FB] text-[#587084] border-[#D5E2EC]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Knowledge Graph Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#D5E2EC] p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] text-[#587084] font-bold uppercase tracking-wider">Total Medical Entities</span>
          <div className="text-2xl font-bold text-[#11423F] mt-1 font-mono">{stats?.total_nodes || graphData.nodes?.length || 0}</div>
        </div>
        <div className="bg-white border border-[#D5E2EC] p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] text-[#587084] font-bold uppercase tracking-wider">Ontology Triples (Edges)</span>
          <div className="text-2xl font-bold text-[#0D9488] mt-1 font-mono">{stats?.total_edges || graphData.edges?.length || 0}</div>
        </div>
        <div className="bg-white border border-[#D5E2EC] p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] text-[#587084] font-bold uppercase tracking-wider">Graph Engine</span>
          <div className="text-xs font-bold text-[#16845B] mt-2 truncate bg-[#E8F6F0] px-2.5 py-1 rounded-full border border-[#16845B]/30 inline-block">{stats?.engine || 'Medical NetworkX'}</div>
        </div>
        <div className="bg-white border border-[#D5E2EC] p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#587084] font-bold uppercase tracking-wider">Clinical Schema</span>
            <div className="text-xs font-bold text-[#11423F] mt-1">SNOMED / DrugBank</div>
          </div>
          <button
            onClick={loadGraph}
            className="p-2.5 rounded-full bg-[#F1F7FB] border border-[#D5E2EC] text-[#11423F] hover:text-[#1FB6A6] hover:bg-[#11423F] transition-colors"
            title="Refresh Graph"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Search & Node Directory */}
        <div className="lg:col-span-5 bg-white border border-[#D5E2EC] rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider flex items-center space-x-2">
              <div className="p-1 rounded-md bg-[#E6F8F6] text-[#0D9488]">
                <Database className="h-3.5 w-3.5" />
              </div>
              <span>Medical Entity Directory</span>
            </h4>
            <span className="text-[11px] font-mono text-[#587084] bg-[#F1F7FB] px-2 py-0.5 rounded-full border border-[#D5E2EC] font-semibold">{filteredNodes.length} entities</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8898AA]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drugs, diseases, symptoms..."
              className="w-full bg-[#F8FCFE] border border-[#D5E2EC] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#163247] placeholder-[#8898AA] focus:outline-none focus:border-[#1FB6A6] focus:ring-2 focus:ring-[#1FB6A6]/20 transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  selectedType === t
                    ? 'bg-[#11423F] text-white shadow-xs'
                    : 'bg-[#F1F7FB] text-[#587084] hover:bg-[#E2EDF5] hover:text-[#11423F]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Node List */}
          <div className="h-[420px] overflow-y-auto space-y-1 pr-1 divide-y divide-[#E8F0F5]">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#1FB6A6] bg-[#E6F8F6] ring-1 ring-[#1FB6A6]/30'
                      : 'border-transparent hover:border-[#D5E2EC] hover:bg-[#F8FCFE]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#163247]">{node.label}</div>
                    <div className="text-[10px] font-mono text-[#587084]">{node.id}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getNodeBadgeColor(node.type)}`}>
                    {node.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Relationship Inspector */}
        <div className="lg:col-span-7 bg-white border border-[#D5E2EC] rounded-2xl p-6 shadow-sm space-y-4">
          {selectedNode ? (
            <div>
              {/* Selected Node Details */}
              <div className="pb-4 border-b border-[#D5E2EC] flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-lg font-bold text-[#11423F]">{selectedNode.label}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getNodeBadgeColor(selectedNode.type)}`}>
                      {selectedNode.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#587084] mt-1">Entity ID: <span className="font-mono text-[#11423F] font-bold">{selectedNode.id}</span></p>
                </div>
                <div className="text-xs text-[#11423F] font-mono font-bold bg-[#E6F8F6] px-3 py-1 rounded-full border border-[#0D9488]/30">
                  {nodeEdges.length} relations
                </div>
              </div>

              {/* Connected Relationships */}
              <div className="mt-4 space-y-3">
                <h4 className="text-xs font-bold text-[#11423F] uppercase tracking-wider flex items-center space-x-2">
                  <div className="p-1 rounded-md bg-[#E6F8F6] text-[#0D9488]">
                    <Share2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Connected Knowledge Graph Edges</span>
                </h4>

                <div className="h-[380px] overflow-y-auto space-y-2.5 pr-1">
                  {nodeEdges.length === 0 ? (
                    <p className="text-xs text-[#8898AA] italic">No direct relationships linked to this node.</p>
                  ) : (
                    nodeEdges.map((edge, idx) => {
                      const isOutgoing = edge.source === selectedNode.id;
                      const otherId = isOutgoing ? edge.target : edge.source;
                      const otherNode = graphData.nodes.find(n => n.id === otherId);

                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#F8FCFE] border border-[#D5E2EC] text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 font-bold">
                              <span className="text-[#163247]">{selectedNode.label}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#E3F2FA] text-[#0878B9] border border-[#0878B9]/30 font-mono text-[10px]">
                                {isOutgoing ? `──[${edge.type}]──▶` : `◀──[${edge.type}]──`}
                              </span>
                              <span className="text-[#0D9488]">{otherNode?.label || otherId}</span>
                            </div>
                            {edge.severity && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                                {edge.severity}
                              </span>
                            )}
                          </div>
                          {edge.description && (
                            <p className="text-[#587084] text-[11px] leading-relaxed pt-1">
                              {edge.description}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#8898AA] text-xs">
              Select an entity on the left to inspect its clinical relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
