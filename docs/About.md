# About Page

## Overview

The About page provides detailed professional information about Themistoklis Baltzakis, showcasing his expertise, experience, and achievements in cloud architecture and cybersecurity.

## Features

### Hero Section

- **Page Title**: "About Me" with animated styling
- **Professional Title**: Cloud Architect & Cybersecurity Specialist
- **Brief Description**: Overview of 15+ years of IT expertise

### Professional Summary

- **Background**: Computer Science degree and industry certifications
- **Expertise Areas**: Azure AD, Microsoft 365, multi-cloud environments
- **Approach**: Technical precision combined with strategic thinking
- **Community Impact**: Contributions during COVID-19 and airport infrastructure rebuild
- **Current Research**: Master's research in data-driven agricultural innovations

### Key Focus Areas

Three main areas presented in interactive cards:

- **Cloud Architecture**: Azure, AWS, multi-cloud migration, infrastructure automation
- **Cybersecurity**: Zero-trust security, identity management, threat protection
- **AI/ML Integration**: Data analytics, smart automation, digital transformation

### Skills & Certifications

Two-column layout displaying:

- **Top Skills**: Microsoft Azure Solutions Architect Expert, CISSP, CEH, ITIL, Azure AD
- **Certifications**: Zero Trust Security, Multi-Cloud Migration, Microsoft 365 Security, Compliance & Risk Management

### Languages

- **English**: Full Professional proficiency
- **Greek**: Native/Bilingual proficiency

### Honors & Awards

- **Cisco Incubator 12.0**: 3rd Place in Customer Experience Track
- **Scholarship Recipient**: Academic Excellence

### Call to Action

- **Get In Touch**: Link to contact page

### Skills Radar

An interactive SVG radar chart (`SkillsRadar` component) positioned between the Key Focus Areas and Skills & Certifications sections:

- **6 skill axes**: Networking (95%), Security (88%), Cloud (82%), DevOps (75%), Programming (78%), Systems (90%)
- **Click-to-expand**: Clicking a skill label reveals a detail panel with proficiency bar, certifications, and years of experience
- **Scroll-triggered animation**: Radar polygon animates in via IntersectionObserver with spring easing
- **Proficiency levels**: Expert (≥90), Advanced (≥80), Proficient (≥70), Intermediate (≥50)
- **Accessible**: SVG has `role="img"` + `aria-label`, skill labels are `role="button"` with `aria-label` showing percentage

## Components Used

- `Navigation`: Site navigation
- `AnimatedSection`: Staggered content animations
- `CircuitBackground`: Animated tech background
- `HoverCard`: Interactive card hover effects
- `SkillsRadar`: Interactive SVG radar chart with clickable skill labels
- Lucide React icons: Briefcase, Cloud, Shield, Cpu, Award, GraduationCap

## Design Features

- **Dark Theme**: Navy gradient background with circuit patterns
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Hover Effects**: Interactive elements with color transitions
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Typography Hierarchy**: Clear heading structure and content organization

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Icon labels and descriptions
- Keyboard navigation support
- High contrast design

## Performance

- Lazy loading of animations
- Optimized component rendering
- Efficient CSS transitions
- Minimal re-renders

## SEO Considerations

- Descriptive page title and headings
- Structured content for search engines
- Professional keyword integration
- Clear information hierarchy
