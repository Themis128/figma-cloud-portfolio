import { Github, Globe, Linkedin } from "lucide-react";

export function AuthorBio() {
  return (
    <section className="mt-12 pt-8 border-t border-border/20">
      <div className="flex items-start gap-4 rounded-lg border border-border/20 bg-foreground/5 backdrop-blur-sm p-5">
        {/* Avatar */}
        <div className="shrink-0 w-14 h-14 rounded-full bg-linear-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/20 flex items-center justify-center">
          <span className="text-lg font-bold text-cyan-400 font-mono">TB</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Themistoklis Baltzakis
          </h3>
          <p className="text-xs font-mono text-cyan-400/80 mb-2">
            Cloud Architect & Cybersecurity Specialist
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Building secure, scalable cloud infrastructure. Writing about AWS,
            network security, and modern web development.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/tbaltzakis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-border/20 text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://linkedin.com/in/tbaltzakis"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-border/20 text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://www.baltzakisthemis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-border/20 text-muted-foreground hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
              aria-label="Website"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
