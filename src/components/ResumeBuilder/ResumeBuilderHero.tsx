"use client";

import { useState } from "react";

export default function ResumeBuilderHero() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // In production, this would send to an API
      // eslint-disable-next-line no-console
      console.log("Notification signup:", email);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">Coming Soon</span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-in">
          <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Resume Builder
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-slide-in delay-150">
          Interactive resume builder coming soon. Check back for an{" "}
          <span className="text-primary font-semibold">AI-powered</span> resume
          generation tool that will transform your career journey into stunning,
          professional resumes.
        </p>

        {/* Features preview */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-scale-in delay-300">
          {[
            "AI-Powered",
            "ATS-Optimized",
            "Multiple Templates",
            "Real-time Preview",
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm font-medium backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Email signup form */}
        <div className="max-w-md mx-auto animate-scale-in delay-500">
          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for updates"
                className="flex-1 px-4 py-3 rounded-lg bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary font-medium animate-scale-in">
              ✓ Thanks! We'll notify you when it launches.
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            No spam, ever. Only product updates.
          </p>
        </div>
      </div>
    </section>
  );
}
