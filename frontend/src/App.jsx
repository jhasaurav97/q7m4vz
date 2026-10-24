import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import PageHeading from "./components/PageHeading";
import ContextStrip from "./components/ContextStrip";
import MetricsSection from "./components/MetricsSection";
import ForecastChart from "./components/ForecastChart";
import GenerationRecords from "./components/GenerationRecords";
import PageFooter from "./components/PageFooter";
import { getWindAnalysis } from "./api/analysis";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalysis() {
      setStatus("loading");
      setError("");

      try {
        const result = await getWindAnalysis(controller.signal);

        setAnalysis(result);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;

        setError(err.message || "Unable to load wind analysis.");
        setStatus("error");
      }
    }

    loadAnalysis();

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main
        id="overview"
        className="mx-auto min-h-screen max-w-[1700px] px-4 sm:px-6 lg:ml-60 lg:px-8"
      >
        <Topbar status={status} />

        <PageHeading />

        <ContextStrip metrics={analysis?.metrics} />

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <strong>Unable to load analysis.</strong>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <MetricsSection metrics={analysis?.metrics} />

        <ForecastChart
          data={analysis?.data ?? []}
          loading={status === "loading"}
          error={error}
        />

        <GenerationRecords data={analysis?.data ?? []} />

        {analysis && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800">
              Analysis assumptions
            </h2>

            <p className="mt-2 text-xs leading-6 text-slate-600">
              Decision period: {analysis.decisionPeriod}. Delivery period:{" "}
              {analysis.deliveryPeriod}. Timezone: {analysis.timezone}.
            </p>

            <p className="mt-1 text-xs leading-6 text-slate-600">
              {analysis.assumptions?.decisionCutoff}
            </p>
          </div>
        )}

        <PageFooter />
      </main>
    </div>
  );
}

export default App;
