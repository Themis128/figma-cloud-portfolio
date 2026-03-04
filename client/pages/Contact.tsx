"use client";

import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Globe,
  Briefcase,
  Award,
  FolderGit2,
} from "lucide-react";
import ContactForm from "../components/ContactForm";

// Contact information data
const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "baltzakis.themis@gmail.com",
    href: "mailto:baltzakis.themis@gmail.com",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/baltzakis-themis",
    href: "https://linkedin.com/in/baltzakis-themis",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    external: true,
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/Themis128",
    href: "https://github.com/Themis128",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    external: true,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Koropi/Athens, Greece",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: Phone,
    label: "Mobile",
    value: "+30 697 777 7838",
    href: "tel:+30697777838",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  {
    icon: Globe,
    label: "Portfolio",
    value: "baltzakisthemis.com",
    href: "https://baltzakisthemis.com",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    external: true,
  },
];

// Quick action buttons
const quickActions = [
  {
    label: "Send Project Inquiry",
    href: "mailto:baltzakis.themis@gmail.com?subject=Project Inquiry",
    icon: Send,
    primary: true,
  },
  {
    label: "Connect on LinkedIn",
    href: "https://linkedin.com/in/baltzakis-themis",
    icon: Linkedin,
    external: true,
  },
  {
    label: "View Projects",
    href: "/projects",
    icon: FolderGit2,
  },
];

// Statistics
const stats = [
  { value: "15+", label: "Years Experience", icon: Briefcase },
  { value: "100+", label: "Projects Completed", icon: FolderGit2 },
  { value: "5+", label: "Certifications", icon: Award },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
            Get In Touch
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
          <p className="text-foreground/80 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of your vision.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={info.label}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.external ? "_blank" : undefined}
                        rel={info.external ? "noopener noreferrer" : undefined}
                        className="block"
                      >
                        <ContactCard info={info} />
                      </a>
                    ) : (
                      <ContactCard info={info} />
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                {quickActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      action.primary
                        ? "bg-cyan-400 hover:bg-cyan-500 text-background"
                        : "border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </a>
                ))}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card rounded-lg p-4 border border-border text-center"
                  >
                    <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Send a Message
              </h2>
              <p className="text-muted-foreground mb-6">
                Fill out the form below and I'll get back to you as soon as
                possible.
              </p>
              <ContactForm />
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-card rounded-lg p-8 border border-border max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Looking for more information?
              </h3>
              <p className="text-muted-foreground mb-6">
                Check out my resume or learn more about my background and
                experience.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/about"
                  className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-all duration-300 border border-border"
                >
                  Learn More About Me
                </a>
                <a
                  href="/resume"
                  className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-all duration-300 border border-border"
                >
                  View Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Card Component
function ContactCard({ info }: { info: (typeof contactInfo)[number] }) {
  const Icon = info.icon;
  return (
    <div className="bg-card rounded-lg p-4 border border-border hover:border-cyan-400/30 hover:bg-card/80 transition-all duration-300 group cursor-pointer">
      <div className="flex items-start gap-3">
        <div
          className={`inline-flex items-center justify-center w-10 h-10 ${info.bgColor} rounded-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-5 h-5 ${info.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
            {info.label}
          </p>
          <p className="text-foreground font-medium text-sm truncate">
            {info.value}
          </p>
        </div>
      </div>
    </div>
  );
}
