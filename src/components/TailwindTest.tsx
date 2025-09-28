// Test component to verify Tailwind CSS is working
'use client'

export default function TailwindTest() {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
      <div className="shrink-0">
        <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">TW</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS Test</div>
        <p className="text-slate-500">
          If you can see this styled properly with colors, shadows, and spacing, 
          then Tailwind CSS is working correctly!
        </p>
        <div className="mt-4 space-x-2">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded">
            Success Button
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Responsive classes:{' '}
          <span className="hidden sm:inline">visible on small+ screens</span>
          <span className="sm:hidden">visible on mobile only</span>
        </div>
      </div>
    </div>
  )
}
