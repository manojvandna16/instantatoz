import { LayoutGrid } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Service Categories</h1>
        <p className="text-sm text-gray-400 mt-0.5">Create and manage the service categories available on the platform.</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-white font-semibold">Service Categories</p>
        <p className="text-gray-400 text-sm mt-1">This section is under active development. Full functionality coming soon.</p>
      </div>
    </div>
  );
}
