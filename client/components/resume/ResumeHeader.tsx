import { useResume } from "./ResumeContext";

export function ResumeHeader() {
  const { resumeData } = useResume();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {resumeData?.personalInfo.name || "Resume Builder"}
            </h1>
            <p className="text-gray-600">
              {resumeData?.personalInfo.title ||
                "Create and manage your professional resume"}
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Save Resume
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              Preview
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
