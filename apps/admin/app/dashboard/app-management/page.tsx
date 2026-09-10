'use client';

import { Smartphone, Globe, ExternalLink, GitBranch, Package, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const APP_INFO = {
  name: 'Instantatoz',
  bundleId: 'com.instantatoz.app',
  androidPackage: 'com.instantatoz.app',
  version: '1.0.0',
  buildNumber: '1',
  webVersion: '1.0.0',
};

const TECH_STACK = [
  { category: 'Mobile App', items: ['React Native (Expo)', 'TypeScript', 'Firebase SDK', 'Razorpay React Native'] },
  { category: 'Admin Panel', items: ['Next.js 16.3', 'TypeScript', 'Firebase Admin SDK', 'Recharts'] },
  { category: 'Backend / Database', items: ['Firebase Firestore', 'Firebase Auth', 'Firebase Storage', 'Cloud Functions'] },
  { category: 'Payments', items: ['Razorpay Payment Gateway', 'Razorpay Orders API', 'Razorpay Refunds API'] },
  { category: 'Infrastructure', items: ['Vercel (Admin/Web)', 'Expo Application Services (Mobile)', 'GitHub'] },
];

export default function AppManagementPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">App Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Application versions, configuration, and technical stack overview.</p>
      </div>

      {/* App Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Mobile App</p>
              <p className="text-gray-500 text-xs">React Native / Expo</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Version</span>
              <span className="text-white font-medium">{APP_INFO.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Build</span>
              <span className="text-white font-medium">#{APP_INFO.buildNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Package</span>
              <span className="text-white font-mono text-xs">{APP_INFO.androidPackage}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Android
            </span>
            <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" /> iOS Pending
            </span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Web / Admin</p>
              <p className="text-gray-500 text-xs">Next.js on Vercel</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Admin Version</span>
              <span className="text-white font-medium">{APP_INFO.webVersion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Framework</span>
              <span className="text-white font-medium">Next.js 16.3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Node.js</span>
              <span className="text-white font-medium">18.x LTS</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full w-fit">
              <CheckCircle2 className="w-3 h-3" /> Live on Vercel
            </span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Firebase Project</p>
              <p className="text-gray-500 text-xs">Backend as a Service</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Project ID</span>
              <span className="text-white font-mono text-xs">instantatoz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Region</span>
              <span className="text-white font-medium">Asia South 1</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="text-white font-medium">Blaze (Pay-as-go)</span>
            </div>
          </div>
          <div className="mt-4">
            <a href="https://console.firebase.google.com/project/instantatoz" target="_blank" rel="noopener"
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 underline">
              <ExternalLink className="w-3 h-3" /> Open Firebase Console
            </a>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Technology Stack</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK.map(layer => (
            <div key={layer.category}>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{layer.category}</p>
              <ul className="space-y-1">
                {layer.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: 'GitHub Repository', href: 'https://github.com/manojvandna16/instantatoz', icon: GitBranch, color: 'text-gray-300' },
            { label: 'Vercel Deployments', href: 'https://vercel.com/dashboard', icon: Globe, color: 'text-gray-300' },
            { label: 'Firebase Console', href: 'https://console.firebase.google.com/project/instantatoz', icon: Package, color: 'text-orange-400' },
            { label: 'Razorpay Dashboard', href: 'https://dashboard.razorpay.com', icon: ExternalLink, color: 'text-blue-400' },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener"
              className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-3 transition-all group">
              <link.icon className={`w-4 h-4 ${link.color}`} />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{link.label}</span>
              <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-gray-400 ml-auto" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
