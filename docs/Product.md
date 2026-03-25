# Product Page

## Overview

The Product page showcases Themistoklis Baltzakis' professional work experience and career history in detail, highlighting his expertise in cloud architecture, cybersecurity, and IT infrastructure.

## Features

### InteractiveTimeline Component

The work experience data is rendered via the `InteractiveTimeline` component (`src/components/interactive/InteractiveTimeline.tsx`), which provides:

- **Desktop view** (`hidden md:block`): Vertical animated timeline line, clickable nodes to expand/collapse individual experiences, pulse-glow keyframes on active node
- **Mobile view** (`md:hidden`): All experiences expanded by default in a card layout
- **Dual rendering**: Both views are in the DOM; CSS visibility toggles based on viewport width

### Work Experience Timeline

- **Skaramangas Shipyards**: IT Network Engineer (2025 to Present)
  - Cisco-based network infrastructure for maritime operations
  - Fortinet firewall environments for data center security
  - High availability of core network systems across 1,000+ ports

- **Estarta Solutions**: Network and Systems Engineer (Recent)
  - Cisco infrastructure issues in data centers, 100% SLA compliance
  - Streamlined RMA process, 30% logistics efficiency improvement

- **Cosmos Business Systems**: IT Consultant Analyst (Recent)
  - Azure Active Directory management and troubleshooting
  - Microsoft 365 services and Intune MDM/MAM

- **CPI SA (outsourced @ Nielsen Hellas)**: IT Consultant Analyst (Mar 2023)
  - Active Directory environments and ServiceNow ITSM
  - CyberArk Privileged Access Management

- **Printec Hellas**: Technical Engineer (Jan 2022 to Sep 2022)
  - Windows and Cisco Systems: servers, switches, routers, firewalls
  - Hardware-based network installation and troubleshooting

### Experience Details

Each position includes:

- **Company Information**: Organization name and location
- **Job Title**: Specific role and responsibilities
- **Time Period**: Employment duration
- **Detailed Responsibilities**: Comprehensive task descriptions
- **Technical Skills**: Specific technologies and tools used

## Components Used

- **Navigation**: Site navigation
- **CircuitBackground**: Animated background
- **InteractiveTimeline**: Interactive vertical timeline with expand/collapse
- **AnimatedSection**: Framer Motion scroll-reveal wrapper
- **Link** (Next.js): Internal navigation for CTA buttons

## Technical Implementation

### Data Structure

- **Experience Array**: Structured work history data (5 positions)
- **Responsibility Lists**: Detailed task descriptions per position
- **Location Information**: Geographic work locations (Greece)

### Layout Design

- **InteractiveTimeline**: Vertical timeline with animated line and clickable nodes (desktop) / all-expanded cards (mobile)
- **Hero Section**: Page title, subtitle, and cyan gradient divider
- **CTA Section**: "Build Resume" and "Get In Touch" buttons
- **Responsive Design**: Mobile-first layout with dual-view rendering

## Content Organization

### Professional Progression

- **Recent Experience**: Latest roles and achievements
- **Technical Depth**: Detailed technical responsibilities
- **Career Development**: Progression through different roles

### Skill Demonstration

- **Cloud Technologies**: Azure, VMware, Cisco platforms
- **Security**: Identity management, access control
- **Infrastructure**: Virtualization and network management

## User Experience

### Information Hierarchy

- **Clear Structure**: Logical information organization
- **Readable Format**: Bullet-point responsibility lists
- **Professional Presentation**: Business-appropriate styling

### Navigation

- **Back to Home**: Return navigation
- **Consistent Design**: Matches overall site theme

## SEO Considerations

- **Keyword Integration**: Technical skill keywords
- **Professional Content**: Career-focused information
- **Structured Data**: Clear information hierarchy

## Recent Enhancements

- **InteractiveTimeline**: Replaced static cards with animated vertical timeline (Mar 2026)
- **Dual-view rendering**: Desktop expand/collapse + mobile all-expanded views
- **CTA buttons**: "Build Resume" and "Get In Touch" links added below timeline
