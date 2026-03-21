'use client';

import Image from 'next/image';
import { useState } from 'react';
import AchievementBadge from '@/components/interactive/AchievementBadge';
import BadgeModal, { type BadgeData } from '@/components/interactive/BadgeModal';

interface BadgeItem {
  name: string;
  issuer: string;
  year: string;
  desc: string;
  image: string;
}

const BADGES: BadgeItem[] = [
  {
    name: 'CyberOps Associate',
    issuer: 'Cisco',
    year: '2025',
    desc: 'Security monitoring, threat detection, and incident response with 30+ hands-on labs.',
    image: 'https://images.credly.com/images/53f37f83-04a1-4935-9b1e-21a99cc6e1b2/CyberOpsAssoc.png',
  },
  {
    name: 'Career Preparation Workshop',
    issuer: 'Cisco',
    year: '2025',
    desc: 'Professional readiness training and enrollment in Cisco Talent Bridge Matching Engine.',
    image: 'https://images.credly.com/images/8d97e39e-2a05-4ed7-88a3-3413bc88c7bd/CPW.png',
  },
  {
    name: 'CCNA: Intro to Networks',
    issuer: 'Cisco',
    year: '2024',
    desc: 'IP addressing, networking fundamentals, and 54 Packet Tracer labs completed.',
    image: 'https://images.credly.com/images/70d71df5-f3dc-4380-9b9d-f22513a70417/CCNAITN__1_.png',
  },
  {
    name: 'Networking Basics',
    issuer: 'Cisco',
    year: '2024',
    desc: 'Network types, protocols, and connectivity with 13 Packet Tracer activities.',
    image: 'https://images.credly.com/images/5bdd6a39-3e03-4444-9510-ecff80c9ce79/image.png',
  },
  {
    name: 'Data Analytics Essentials',
    issuer: 'Cisco',
    year: '2024',
    desc: 'Data collection, processing, and visualization to extract business value.',
    image: 'https://images.credly.com/images/1fdfeaeb-e61c-4450-bdfe-a07bd4e715df/image.png',
  },
  {
    name: 'Intro to Data Science',
    issuer: 'Cisco',
    year: '2024',
    desc: 'Foundations of Data Analytics, Data Engineering, and AI/ML concepts.',
    image: 'https://images.credly.com/images/b38a42e0-dc58-4ce2-b6c0-28d978e8aaad/image.png',
  },
  {
    name: 'DevNet Associate',
    issuer: 'Cisco',
    year: '2023',
    desc: 'Python, Linux, REST APIs, and network automation for software-defined infrastructure.',
    image: 'https://images.credly.com/images/35985f2b-38d6-4b6f-8e63-42b17d3b5c69/DEVASC_Learning_Badge.png',
  },
  {
    name: 'KNIME Analytics Platform L1',
    issuer: 'KNIME',
    year: '2023',
    desc: 'Passed L1 exam — data cleaning, transformation, and visual workflow analytics.',
    image: 'https://images.credly.com/images/ba8f2415-703b-4d41-a850-5aecbabd5cf4/L1_Large.png',
  },
  {
    name: 'Python Essentials 2',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Intermediate Python: OOP, exception handling, modules, and file operations.',
    image: 'https://images.credly.com/images/3f802526-7274-4230-91ab-f6d1a35340e6/image.png',
  },
  {
    name: 'Python Essentials 1',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Core programming concepts, Python syntax, data types, and control flow.',
    image: 'https://images.credly.com/images/68c0b94d-f6ac-40b1-a0e0-921439eb092e/image.png',
  },
  {
    name: 'Enterprise Networking & Automation',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Scalable architectures, dynamic routing, security threats, and network automation.',
    image: 'https://images.credly.com/images/0a6d331e-8abf-4272-a949-33f754569a76/CCNAENSA__1_.png',
  },
  {
    name: 'Kubernetes Fundamentals',
    issuer: 'Linux Foundation',
    year: '2022',
    desc: 'Kubernetes deployment, container orchestration, and cluster management (LFS258).',
    image: 'https://images.credly.com/images/123746a7-fbbe-4fdd-9c0c-f0254e53292a/blob',
  },
  {
    name: 'Junior Cybersecurity Analyst',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Network monitoring, firewalls, cloud security, and cryptography fundamentals.',
    image: 'https://images.credly.com/images/441578ec-c0f3-46cc-95fc-86b27e90cf4f/image.png',
  },
  {
    name: 'Cyber Threat Management',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Security policies, vulnerability assessment, risk management, and threat analysis.',
    image: 'https://images.credly.com/images/5d5ac32b-d239-42b8-9665-8a921dc3ab47/image.png',
  },
  {
    name: 'Endpoint Security',
    issuer: 'Cisco',
    year: '2022',
    desc: 'OS security, endpoint protection, and network security fundamentals.',
    image: 'https://images.credly.com/images/0ca5f542-fb5e-4a22-9b7a-c1a1ce4c3db7/EndpointSecurity.png',
  },
  {
    name: 'Networking Devices & Config',
    issuer: 'Cisco',
    year: '2022',
    desc: 'Cloud and virtualization, IP addressing schemes, and device initial setup.',
    image: 'https://images.credly.com/images/88316fe8-5651-4e61-a6be-5be1558f049e/image.png',
  },
];

function toBadgeData(badge: BadgeItem): BadgeData {
  return {
    name: badge.name,
    issuer: badge.issuer,
    image: badge.image,
    description: badge.desc,
  };
}

export default function BadgesGrid() {
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BADGES.map((badge, i) => (
          <AchievementBadge
            key={badge.name}
            index={i}
            onClick={() => setSelectedBadge(toBadgeData(badge))}
          >
            <div className="p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
              <div className="flex items-center gap-3 mb-1">
                <Image
                  src={badge.image}
                  alt={badge.name}
                  width={40}
                  height={40}
                  className="rounded shrink-0"
                  unoptimized
                />
                <div className="min-w-0">
                  <span className="text-foreground/90 text-sm font-medium block truncate">
                    {badge.name}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px] font-mono">
                    {badge.issuer} &middot; {badge.year}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed mt-1.5 pl-13">
                {badge.desc}
              </p>
            </div>
          </AchievementBadge>
        ))}
      </div>
      <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </>
  );
}
