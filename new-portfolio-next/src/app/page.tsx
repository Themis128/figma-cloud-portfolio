import Image from 'next/image'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Modern Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Built with Next.js 15, TypeScript, and Tailwind CSS. A complete migration 
            from Nuxt.js with improved performance and modern features.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              View Projects
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Contact Me
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Performance</h3>
                <p className="text-sm opacity-90">Optimized with Next.js 15</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Modern</h3>
                <p className="text-sm opacity-90">Latest React patterns</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Responsive</h3>
                <p className="text-sm opacity-90">Mobile-first design</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Accessible</h3>
                <p className="text-sm opacity-90">WCAG compliant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}