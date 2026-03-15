import { z } from "zod";

// --- Sub-schemas ---

export const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Job title is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  date: z.string().min(1, "Date is required"),
  credentialId: z.string().optional(),
});

export const skillCategorySchema = z.object({
  category: z.string().min(1, "Category name is required"),
  items: z.array(z.string().min(1)).min(1, "Add at least one skill"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()).default([]),
});

// --- Main form schema ---

export const resumeFormSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z
    .string()
    .max(500, "Summary must be 500 characters or fewer")
    .optional()
    .default(""),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  projects: z.array(projectSchema).default([]),
});

// --- Inferred types ---

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Project = z.infer<typeof projectSchema>;
export type ResumeFormData = z.infer<typeof resumeFormSchema>;

// --- Template types ---

export type TemplateName = "classic" | "modern" | "minimal" | "executive" | "creative" | "bold" | "emerald";

export interface ResumeTemplate {
  name: TemplateName;
  label: string;
  description: string;
  render: (data: ResumeFormData) => string;
}

// --- Default values ---

export const defaultResumeData: ResumeFormData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    github: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  projects: [],
};

// --- Sample data for demo ---

export const sampleResumeData: ResumeFormData = {
  personalInfo: {
    name: "Alex Johnson",
    title: "Senior Network Engineer",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedIn: "https://linkedin.com/in/alexjohnson",
    github: "https://github.com/alexjohnson",
    website: "",
  },
  summary:
    "Experienced network engineer with 8+ years designing, implementing, and managing enterprise network infrastructure. Specialized in cloud networking, security architecture, and automation using Python and Ansible.",
  experience: [
    {
      company: "CloudTech Solutions",
      role: "Senior Network Engineer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      endDate: "",
      current: true,
      highlights: [
        "Designed and deployed multi-region AWS network architecture serving 10M+ users",
        "Reduced network incidents by 60% through automated monitoring and alerting",
        "Led migration from on-premises to hybrid cloud infrastructure",
      ],
    },
    {
      company: "NetSecure Inc.",
      role: "Network Engineer",
      location: "Austin, TX",
      startDate: "2017-06",
      endDate: "2021-02",
      current: false,
      highlights: [
        "Managed Cisco and Fortinet firewall infrastructure across 15 branch offices",
        "Implemented zero-trust network architecture reducing attack surface by 40%",
        "Automated network configuration with Ansible, saving 20 hours/week",
      ],
    },
  ],
  education: [
    {
      institution: "University of Texas at Austin",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2013-08",
      endDate: "2017-05",
      gpa: "3.7",
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect Professional",
      issuer: "Amazon Web Services",
      date: "2023-06",
      credentialId: "AWS-SAP-12345",
    },
    {
      name: "CCNP Enterprise",
      issuer: "Cisco",
      date: "2022-01",
      credentialId: "",
    },
    {
      name: "CompTIA Security+",
      issuer: "CompTIA",
      date: "2020-09",
      credentialId: "",
    },
  ],
  skills: [
    {
      category: "Networking",
      items: ["TCP/IP", "BGP", "OSPF", "VPN", "SD-WAN", "DNS", "DHCP"],
    },
    {
      category: "Cloud & DevOps",
      items: ["AWS", "Azure", "Terraform", "Ansible", "Docker", "Kubernetes"],
    },
    {
      category: "Security",
      items: [
        "Firewalls",
        "IDS/IPS",
        "Zero Trust",
        "SIEM",
        "Penetration Testing",
      ],
    },
    {
      category: "Programming",
      items: ["Python", "Bash", "Go", "REST APIs"],
    },
  ],
  projects: [
    {
      name: "Network Automation Framework",
      description:
        "Built a Python-based framework for automated network device configuration and compliance checking across 200+ devices.",
      url: "https://github.com/alexjohnson/netauto",
      technologies: ["Python", "Netmiko", "NAPALM", "FastAPI"],
    },
  ],
};
