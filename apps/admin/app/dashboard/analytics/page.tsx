import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Deep-dive into platform performance metrics and usage trends.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-white font-semibold">Analytics</p>
        <p className="text-gray-400 text-sm mt-1">This section is under active development. Full functionality coming soon.</p>
      </div>
    </div>
  );
}
