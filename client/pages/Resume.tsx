import type { ResumeData } from '@shared/api'
import { ArrowLeft, Download, Save } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import CircuitBackground from '@/components/CircuitBackground'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateResumePDF } from '@/lib/api'

const defaultResume: ResumeData = {
  name: 'Themistoklis Baltzakis',
  title: 'Cloud Architect & Cybersecurity Specialist',
  contact: {
    email: 'baltzakis.themis@gmail.com',
    linkedin: 'baltzakis-themis',
    website: 'www.baltzakisthemis.com',
  },
  summary:
    'Results-driven Cloud Architect and Cybersecurity Specialist with 15+ years of IT expertise, specializing in Azure AD, Microsoft 365, and multi-cloud environments. Proven track record in designing secure, scalable cloud solutions and leading digital transformation initiatives. Expert in identity management, compliance frameworks, and enterprise security architecture.',
  competencies: {
    'Cloud Platforms & Infrastructure': [
      'Microsoft Azure (Expert)',
      'Amazon Web Services (Advanced)',
      'Google Cloud Platform (Advanced)',
    ],
    'Identity & Access Management': [
      'Azure Active Directory',
      'Microsoft 365 Security',
      'Federation & SSO',
    ],
    'Cybersecurity & Compliance': ['Security Frameworks', 'Threat Detection', 'Risk Management'],
  },
  experience: [
    {
      title: 'Senior Cloud Architect',
      company: 'TechCorp Solutions | Athens, Greece',
      date: 'January 2022 - Present',
      achievements: [
        'Architected and implemented zero-trust security model for Fortune 500 client using Azure AD Premium and Microsoft Defender suite',
        'Led migration of 50,000+ users from on-premises AD to Azure AD, reducing authentication issues by 85%',
        'Designed multi-cloud disaster recovery solution spanning Azure, AWS, and GCP with 99.9% uptime SLA',
      ],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'National Technical University of Athens, Greece',
      date: '2007 - 2011',
    },
  ],
  certifications: [
    {
      name: 'Microsoft Certified: Azure Solutions Architect Expert',
      issuer: 'Microsoft',
      year: '2023',
    },
  ],
}

export default function Resume() {
  const [resume, setResume] = useState<ResumeData>(defaultResume)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateResumePDF(resume)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Resume downloaded successfully!')
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to generate resume. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const updateResume = (field: keyof ResumeData, value: ResumeData[keyof ResumeData]) => {
    setResume((prev) => ({ ...prev, [field]: value }))
  }

  const updateContact = (field: keyof ResumeData['contact'], value: string) => {
    setResume((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden">
      {/* Circuit background */}
      <CircuitBackground />

      {/* Navigation */}
      <Navigation />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">Resume Builder</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toast.info('Resume saved locally')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isGenerating}
                className="bg-cyan-400 hover:bg-cyan-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={resume.name}
                    onChange={(e) => updateResume('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={resume.title}
                    onChange={(e) => updateResume('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resume.contact.email || ''}
                    onChange={(e) => updateContact('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Username</Label>
                  <Input
                    id="linkedin"
                    value={resume.contact.linkedin || ''}
                    onChange={(e) => updateContact('linkedin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={resume.contact.website || ''}
                    onChange={(e) => updateContact('website', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Professional Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  rows={6}
                  value={resume.summary}
                  onChange={(e) => updateResume('summary', e.target.value)}
                  placeholder="Write a compelling professional summary..."
                />
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
              <div className="space-y-4">
                {resume.experience.map((exp, index) => (
                  <div key={`${exp.title}-${index}`} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...resume.experience]
                            newExp[index].title = e.target.value
                            updateResume('experience', newExp)
                          }}
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...resume.experience]
                            newExp[index].company = e.target.value
                            updateResume('experience', newExp)
                          }}
                        />
                      </div>
                      <div>
                        <Label>Date Range</Label>
                        <Input
                          value={exp.date}
                          onChange={(e) => {
                            const newExp = [...resume.experience]
                            newExp[index].date = e.target.value
                            updateResume('experience', newExp)
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Achievements</Label>
                      <Textarea
                        rows={3}
                        value={exp.achievements.join('\n')}
                        onChange={(e) => {
                          const newExp = [...resume.experience]
                          newExp[index].achievements = e.target.value
                            .split('\n')
                            .filter((a) => a.trim())
                          updateResume('experience', newExp)
                        }}
                        placeholder="List key achievements (one per line)..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={`${edu.degree}-${index}`} className="border rounded-lg p-4">
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...resume.education]
                          newEdu[index].degree = e.target.value
                          updateResume('education', newEdu)
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const newEdu = [...resume.education]
                          newEdu[index].institution = e.target.value
                          updateResume('education', newEdu)
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Date</Label>
                      <Input
                        value={edu.date}
                        onChange={(e) => {
                          const newEdu = [...resume.education]
                          newEdu[index].date = e.target.value
                          updateResume('education', newEdu)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Certifications */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="space-y-4">
                {resume.certifications.map((cert, index) => (
                  <div key={`${cert.name}-${index}`} className="border rounded-lg p-4">
                    <div>
                      <Label>Certification Name</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) => {
                          const newCert = [...resume.certifications]
                          newCert[index].name = e.target.value
                          updateResume('certifications', newCert)
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Issuer</Label>
                      <Input
                        value={cert.issuer}
                        onChange={(e) => {
                          const newCert = [...resume.certifications]
                          newCert[index].issuer = e.target.value
                          updateResume('certifications', newCert)
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Year</Label>
                      <Input
                        value={cert.year}
                        onChange={(e) => {
                          const newCert = [...resume.certifications]
                          newCert[index].year = e.target.value
                          updateResume('certifications', newCert)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
