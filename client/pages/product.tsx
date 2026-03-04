import { useState, useEffect } from "react";
import Timeline from "../components/Timeline";
import ContactForm from "../components/ContactForm";
import { generateCircuitBackground } from "../lib/circuit-background";

export default function Product() {
  const [circuitBackground, setCircuitBackground] = useState(null);

  useEffect(() => {
    // Generate circuit background for visual appeal
    setCircuitBackground(generateCircuitBackground());
  }, []);

  const experiences = [
    {
      company: "Estarta Solutions",
      position: "Systems and Network Engineer",
      period: "December 2024 - Present",
      location: "Remote",
      responsibilities: [
        "Designed and implemented Cisco network infrastructure",
        "Configured and maintained enterprise-level firewalls and routers",
        "Performed network security audits and vulnerability assessments",
        "Provided technical support for network-related issues",
        "Collaborated with cross-functional teams on network optimization projects",
      ],
      companyIcon: "/logo-upscaled.svg",
      dateIcon: "/calendar-icon.svg",
      locationIcon: "/location-icon.svg",
    },
    {
      company: "Tech Solutions Inc.",
      position: "Network Administrator",
      period: "January 2022 - November 2024",
      location: "New York, NY",
      responsibilities: [
        "Managed Cisco switches and wireless access points",
        "Implemented VLAN configurations and network segmentation",
        "Monitored network performance and troubleshooted connectivity issues",
        "Created network documentation and standard operating procedures",
        "Trained junior staff on network administration best practices",
      ],
      companyIcon: "/logo-upscaled.svg",
      dateIcon: "/calendar-icon.svg",
      locationIcon: "/location-icon.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Circuit Background */}
      {circuitBackground && (
        <div className="absolute inset-0 pointer-events-none">
          {circuitBackground}
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Portfolio</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </a>
              <a href="/product" className="text-gray-900 font-medium">
                Product
              </a>
              <a href="/projects" className="text-gray-700 hover:text-gray-900">
                Projects
              </a>
              <a href="/resume" className="text-gray-700 hover:text-gray-900">
                Resume
              </a>
              <a href="/contact" className="text-gray-700 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Work Experience & Product Portfolio
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive overview of professional experience and technical
            projects
          </p>
        </div>

        {/* Experience Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Professional Experience
          </h2>
          <Timeline experiences={experiences} />
        </div>

        {/* Technical Skills */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Technical Expertise
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Networking</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Cisco IOS</li>
                <li>VLAN Configuration</li>
                <li>Network Security</li>
                <li>VPN Implementation</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Systems</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Linux Administration</li>
                <li>Windows Server</li>
                <li>Virtualization</li>
                <li>Cloud Computing</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Security</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Firewall Management</li>
                <li>Intrusion Detection</li>
                <li>Security Audits</li>
                <li>Compliance</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Development</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Python</li>
                <li>JavaScript/Node.js</li>
                <li>React</li>
                <li>API Development</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3">
                Enterprise Network Upgrade
              </h3>
              <p className="text-gray-600 mb-4">
                Led a comprehensive network infrastructure upgrade for a
                mid-sized enterprise, migrating from legacy systems to modern
                Cisco solutions.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Designed and implemented new network topology</li>
                <li>Configured Cisco Catalyst switches and routers</li>
                <li>Implemented VLANs and network segmentation</li>
                <li>Enhanced network security with ACLs and firewalls</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-3">
                Cloud Migration Project
              </h3>
              <p className="text-gray-600 mb-4">
                Managed the migration of on-premises infrastructure to AWS cloud
                environment, ensuring minimal downtime and optimal performance.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Designed cloud architecture and migration strategy</li>
                <li>Migrated applications and databases to AWS</li>
                <li>Implemented security controls and compliance measures</li>
                <li>Optimized costs and performance in cloud environment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Let's Connect
          </h2>
          <p className="text-gray-600 mb-6">
            Interested in discussing network solutions, system architecture, or
            potential collaborations? I'd love to hear from you.
          </p>
          <ContactForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              &copy; 2024 Portfolio. Built with React, Next.js, and Tailwind
              CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
