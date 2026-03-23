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
import Link from "next/link";
import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import { trackLead, trackOutboundClick } from "@/components/GoogleAnalytics";
import { HoverCard, HoverButton } from "@/components/HoverAnimations";
import Navigation from "@/components/Navigation";
import { SectionNav } from "@/components/SectionNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { submitContactForm } from "@/lib/api";

const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "contact-info", label: "Contact Info" },
  { id: "contact-form", label: "Send Message" },
  { id: "more-info", label: "More Info" },
] as const;

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

export default function ContactPage() {
  const { getToken } = useRecaptcha();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const recaptchaToken = await getToken("contact");
      await submitContactForm({
        ...formData,
        ...(recaptchaToken !== undefined && { recaptchaToken }),
      });
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      trackLead("contact_form", formData.subject);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />
      <SectionNav sections={SECTIONS} ariaLabel="Contact page sections" />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <div id="hero">
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-16">
            <div className="space-y-3 md:space-y-4">
              <AnimatedSection delay={0.1}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                  Get In Touch
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                I&apos;m always open to discussing new projects, creative ideas, or
                opportunities to be part of your vision.
              </p>
            </AnimatedSection>
          </AnimatedSection>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <div id="contact-info" className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Information */}
              <AnimatedSection delay={0.2} direction="left">
                <div className="space-y-6">
                  {/* Contact Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {contactInfo.map((info, index) => (
                      <HoverCard key={info.label} scale={1.02}>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.external ? "_blank" : undefined}
                            rel={
                              info.external ? "noopener noreferrer" : undefined
                            }
                            onClick={() => trackOutboundClick(info.href!, info.label)}
                            className="block"
                          >
                            <ContactCard info={info} index={index} />
                          </a>
                        ) : (
                          <ContactCard info={info} index={index} />
                        )}
                      </HoverCard>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    {quickActions.map((action) => (
                      <HoverButton key={action.label} scale={1.05}>
                        {action.primary ? (
                          <Button
                            asChild
                            className="bg-cyan-400 hover:bg-cyan-500 text-background font-medium"
                          >
                            <Link
                              href={action.href}
                              target={action.external ? "_blank" : undefined}
                              rel={
                                action.external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              <action.icon className="w-4 h-4 mr-2" />
                              {action.label}
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            variant="outline"
                            className="border-border text-foreground hover:bg-foreground/10"
                          >
                            <Link
                              href={action.href}
                              target={action.external ? "_blank" : undefined}
                              rel={
                                action.external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              <action.icon className="w-4 h-4 mr-2" />
                              {action.label}
                            </Link>
                          </Button>
                        )}
                      </HoverButton>
                    ))}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-foreground/5 backdrop-blur-sm rounded-lg p-4 border border-border text-center"
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
              </AnimatedSection>

              {/* Contact Form */}
              <div id="contact-form">
              <AnimatedSection delay={0.3} direction="right">
                <Card className="bg-foreground/5 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground text-2xl">
                      Send a Message
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Fill out the form below and I&apos;ll get back to you as soon
                      as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground/80">
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your name"
                            required
                            className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-foreground/80">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            required
                            className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-foreground/80">
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What is this about?"
                          required
                          className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-foreground/80">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Your message..."
                          rows={5}
                          required
                          className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground focus:border-cyan-400 focus:ring-cyan-400/20 resize-none"
                        />
                      </div>

                      {/* Status Messages */}
                      {submitStatus === "success" && (
                        <div role="alert" className="p-3 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 text-sm">
                          Message sent successfully! I&apos;ll get back to you soon.
                        </div>
                      )}
                      {submitStatus === "error" && (
                        <div role="alert" className="p-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-400 text-sm">
                          Something went wrong. Please try again or contact me
                          directly via email.
                        </div>
                      )}

                      <HoverButton scale={1.02}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-cyan-400 hover:bg-cyan-500 text-background font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </HoverButton>

                      <p className="text-xs text-foreground/40 mt-3 leading-relaxed text-center">
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-foreground/60"
                        >
                          Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                          href="https://policies.google.com/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-foreground/60"
                        >
                          Terms of Service
                        </a>{" "}
                        apply.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
              </div>
            </div>

            {/* Call to Action */}
            <div id="more-info">
            <AnimatedSection delay={0.5} className="text-center mt-16">
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Looking for more information?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Check out my resume or learn more about my background and
                  experience.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <HoverButton>
                    <Link
                      href="/about/"
                      className="px-6 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-md transition-all duration-300 border border-border"
                    >
                      Learn More About Me
                    </Link>
                  </HoverButton>
                  <HoverButton>
                    <Link
                      href="/resume/"
                      className="px-6 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-md transition-all duration-300 border border-border"
                    >
                      View Resume
                    </Link>
                  </HoverButton>
                </div>
              </div>
            </AnimatedSection>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Contact Card Component
function ContactCard({
  info,
  index,
}: {
  info: (typeof contactInfo)[number];
  index: number;
}) {
  const Icon = info.icon;
  return (
    <div
      className="bg-foreground/5 backdrop-blur-sm rounded-lg p-4 border border-border hover:border-cyan-400/30 hover:bg-foreground/10 transition-all duration-300 group cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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
