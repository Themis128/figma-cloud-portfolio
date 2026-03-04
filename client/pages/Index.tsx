// Home page
import CookieConsentBar from "../components/CookieConsentBar";
import ThemeToggleButton from "../components/ThemeToggleButton";
import AccessibilityButton from "../components/AccessibilityButton";
import SkillsMatrix from "../components/SkillsMatrix";
import Timeline from "../components/Timeline";
import ContactForm from "../components/ContactForm";
import ProjectShowcase from "../components/ProjectShowcase";
import PWAInstallButton from "../components/PWAInstallButton";

export default function Index() {
  return (
    <div>
      <CookieConsentBar />
      <ThemeToggleButton />
      <AccessibilityButton />
      <PWAInstallButton />
      <SkillsMatrix />
      <Timeline />
      <ProjectShowcase />
      <ContactForm />
    </div>
  );
}
