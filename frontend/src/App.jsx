import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import ArgFlowVisualizer from './components/ArgFlowVisualizer';
import EvidenceMatrix from './components/EvidenceMatrix';
import ResponseView from './components/ResponseView';
import KgExplorer from './components/KgExplorer';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import SdgSidePanel from './components/SdgSidePanel';
import { fetchHealth, fetchSampleQueries, submitClinicalQuery } from './services/api';
import { AlertCircle, HeartPulse } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('consultation');
  const [query, setQuery] = useState('Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?');
  const [mode, setMode] = useState('adaptive');
  const [sampleQueries, setSampleQueries] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Initial fetch of health and samples
    const init = async () => {
      try {
        const [h, s] = await Promise.all([fetchHealth(), fetchSampleQueries()]);
        setHealthInfo(h);
        setSampleQueries(s.queries || []);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  const handleExecute = async (userQuery, selectedMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await submitClinicalQuery(userQuery, selectedMode);
      setStateData(response.data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process clinical query');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4F8] text-[#163247] flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FDF0F0] border border-[#C44545]/30 text-[#C44545] text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-[#C44545] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Clinical Consultation Main Workflow */}
        {activeTab === 'consultation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: SDG Sustainability & Impact Panel */}
            <div className="lg:col-span-3 space-y-4">
              <SdgSidePanel />
            </div>

            {/* Main Center Column: Clinical Consultation Console & Results */}
            <div className="lg:col-span-9 space-y-6">
              <QueryInput
                query={query}
                setQuery={setQuery}
                mode={mode}
                setMode={setMode}
                sampleQueries={sampleQueries}
                onExecute={handleExecute}
                isLoading={isLoading}
              />

              {/* Results Grid */}
              {stateData && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left: Final Clinical Synthesis & Dynamic Graph */}
                  <div className="xl:col-span-7 space-y-6">
                    <ResponseView stateData={stateData} />
                    <ArgFlowVisualizer stateData={stateData} />
                  </div>

                  {/* Right: Multi-Source Evidence Matrix */}
                  <div className="xl:col-span-5">
                    <EvidenceMatrix stateData={stateData} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Dynamic ARG Flowchart */}
        {activeTab === 'arg_flow' && (
          <div className="space-y-4">
            <ArgFlowVisualizer stateData={stateData} />
          </div>
        )}

        {/* Tab 3: Multi-Source Evidence Matrix Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <EvidenceMatrix stateData={stateData} />
          </div>
        )}

        {/* Tab 4: Knowledge Graph Explorer */}
        {activeTab === 'kg_explorer' && (
          <div className="space-y-4">
            <KgExplorer />
          </div>
        )}

        {/* Tab 5: Benchmark Evaluation Suite */}
        {activeTab === 'benchmark' && (
          <div className="space-y-4">
            <BenchmarkDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#C9D9E4] bg-white py-4 text-xs text-[#587084]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <p>MedGraph — Adaptive Reasoning Graph Clinical Decision Support System</p>
          <div className="flex items-center space-x-2 text-[#16845B] font-semibold">
            <HeartPulse className="h-4 w-4" />
            <span>Advancing UN SDG 3 (Good Health and Well-Being) & Supporting Goals</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
