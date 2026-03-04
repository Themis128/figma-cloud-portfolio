import { useResume } from "./ResumeContext";

export function ResumeSidebar() {
  useResume();

  return (
    <aside className="bg-white p-6 shadow-sm rounded-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
      <nav className="space-y-2">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          Personal Information
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          Work Experience
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          Education
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          Skills
        </button>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          Projects
        </button>
      </nav>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
            Import Resume
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
            Export Resume
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
            Generate PDF
          </button>
        </div>
      </div>
    </aside>
  );
}
