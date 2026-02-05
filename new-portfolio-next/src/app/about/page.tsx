export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          About Me
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              My Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              I'm a passionate developer with experience in modern web
              technologies. This portfolio showcases my journey from Vue.js and
              Nuxt.js to React and Next.js, demonstrating my ability to adapt
              and learn new technologies.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Technologies
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  React & Next.js
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Expert
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  TypeScript
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Tailwind CSS
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Advanced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Vue.js & Nuxt.js
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Expert
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Migration Goals
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This Next.js version represents a complete migration from the
            original Nuxt.js portfolio, focusing on improved performance, better
            developer experience, and modern React patterns. The migration
            includes component conversion, routing updates, and state management
            improvements.
          </p>
        </div>
      </div>
    </div>
  );
}
