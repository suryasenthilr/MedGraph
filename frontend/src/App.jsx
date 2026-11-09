import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import ArgFlowVisualizer from './components/ArgFlowVisualizer';
import EvidenceMatrix from './components/EvidenceMatrix';
import ResponseView from './components/ResponseView';
import KgExplorer from './components/KgExplorer';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import SdgSidePanel from './components/SdgSidePanel';
import ScreenshotDashboard from './components/ScreenshotDashboard';
import { fetchHealth, fetchSampleQueries, submitClinicalQuery } from './services/api';
import { AlertCircle, HeartPulse, Globe, Camera } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('consultation');
  const [query, setQuery] = useState('Can a diabetic patient with chronic kidney disease who is taking Warfarin safely use Ibuprofen?');
  const [mode, setMode] = useState('adaptive');
  const [sampleQueries, setSampleQueries] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSdgPanel, setShowSdgPanel] = useState(true);

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
            {/* Left Column: SDG Sustainability & Impact Panel */}
            {showSdgPanel && (
              <div className="lg:col-span-3 space-y-4 min-w-0">
                <SdgSidePanel />
              </div>
            )}

            {/* Main Center Column: Clinical Consultation Console & Results */}
            <div className={`${showSdgPanel ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6 min-w-0`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowSdgPanel(!showSdgPanel)}
                  className="inline-flex items-center space-x-1.5 text-xs text-[#587084] hover:text-[#11423F] px-3 py-1.5 rounded-lg bg-white border border-[#D5E2EC] hover:bg-[#F1F7FB] transition-all shadow-xs"
                  title={showSdgPanel ? "Hide SDG Panel to expand workspace" : "Show UN SDGs Panel"}
                >
                  <Globe className="h-3.5 w-3.5 text-[#1FB6A6]" />
                  <span>{showSdgPanel ? "Hide SDG Side Panel (Expand Workspace)" : "Show UN SDGs Panel"}</span>
                </button>

                {stateData && (
                  <button
                    onClick={() => setActiveTab('screenshot')}
                    className="inline-flex items-center space-x-1.5 text-xs text-[#0D9488] font-bold px-3.5 py-1.5 rounded-lg bg-[#E6F8F6] border border-[#0D9488]/30 hover:bg-[#D1F2EE] transition-all shadow-xs"
                    title="Switch to All-in-One Screenshot View"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>📸 All-in-One Screenshot View</span>
                  </button>
                )}
              </div>

              <QueryInput
                query={query}
                setQuery={setQuery}
                mode={mode}
                setMode={setMode}
                sampleQueries={sampleQueries}
                onExecute={handleExecute}
                isLoading={isLoading}
                hasResults={!!stateData}
              />

              {/* Results Section */}
              {stateData && (
                <div className="space-y-6 min-w-0">
                  {/* Full-width Final Clinical Synthesis & Recommendation */}
                  <div className="w-full min-w-0">
                    <ResponseView stateData={stateData} />
                  </div>

                  {/* Telemetry & Multi-Source Evidence Section side-by-side */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-w-0 items-start">
                    <div className="xl:col-span-6 min-w-0">
                      <ArgFlowVisualizer stateData={stateData} />
                    </div>
                    <div className="xl:col-span-6 min-w-0">
                      <EvidenceMatrix stateData={stateData} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Screenshot / Presentation Mode */}
        {activeTab === 'screenshot' && (
          <ScreenshotDashboard
            stateData={stateData}
            query={query}
            mode={mode}
            onSwitchToStandard={() => setActiveTab('consultation')}
          />
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
