import type { ResumeData } from '@shared/api'
import {
  ArrowLeft,
  Award,
  Briefcase,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
// Simple error boundary for Resume page
import React, { useEffect, useState } from 'react'

class ResumeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }
  override componentDidCatch(_error: unknown, _errorInfo: unknown) {
    // Optionally log error
    // console.error('Resume page error:', error, errorInfo)
  }
  override render() {
    if (this.state.hasError) {
      return (
        <div className='p-8 text-red-400 bg-red-900/20 rounded-lg'>
          Something went wrong in the Resume page. Please refresh or try again later.
        </div>
      )
    }
    return this.props.children
  }
}

import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import CircuitBackground from '@/components/CircuitBackground'
import Navigation from '@/components/Navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { generateResumePDF } from '@/lib/api'

// Auto-save configuration
const AUTO_SAVE_DELAY_MS = 2000

const defaultResume: ResumeData = {
  name: 'Themistoklis Baltzakis',
  title: 'Cloud Architect & Cybersecurity Specialist',
  contact: {
    email: 'tbaltzakis@cloudless.gr',
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

function Resume() {
  const [resume, setResume] = useState<ResumeData>(defaultResume)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('resume-draft')
    if (saved) {
      try {
        setResume(JSON.parse(saved))
      } catch (_error) {}
    }
  }, [])

  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timer = setTimeout(() => {
      localStorage.setItem('resume-draft', JSON.stringify(resume))
      setHasUnsavedChanges(false)
      toast.success('Draft saved automatically')
    }, AUTO_SAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [resume, hasUnsavedChanges])

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateResumePDF(resume)
      if (!blob) throw new Error('No PDF blob returned')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Resume downloaded successfully!')
      // Track resume download
      if (typeof window !== 'undefined' && (window as any).trackResumeDownload) {
        ;(window as any).trackResumeDownload()
      }
    } catch (_error) {
      toast.error('Failed to generate resume. Please try again.')
      // Optionally log error
      // console.error('Resume download error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateResume = (field: keyof ResumeData, value: ResumeData[keyof ResumeData]) => {
    setResume((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const updateContact = (field: keyof ResumeData['contact'], value: string) => {
    setResume((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }))
    setHasUnsavedChanges(true)
  }

  const addExperience = () => {
    const newExperience = {
      title: 'New Position',
      company: 'Company Name | Location',
      date: 'Start Date - End Date',
      achievements: ['Key achievement 1', 'Key achievement 2'],
    }
    updateResume('experience', [...resume.experience, newExperience])
  }

  const removeExperience = (index: number) => {
    updateResume(
      'experience',
      resume.experience.filter((_, i) => i !== index),
    )
  }

  const updateExperience = (index: number, field: string, value: unknown) => {
    const newExperience = [...resume.experience]
    const existing = newExperience[index]
    if (existing) {
      newExperience[index] = { ...existing, [field]: value }
      updateResume('experience', newExperience)
    }
  }

  const addEducation = () => {
    const newEducation = {
      degree: 'Degree Name',
      institution: 'Institution Name | Location',
      date: 'Start Year - End Year',
    }
    updateResume('education', [...resume.education, newEducation])
  }

  const removeEducation = (index: number) => {
    updateResume(
      'education',
      resume.education.filter((_, i) => i !== index),
    )
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...resume.education]
    const existing = newEducation[index]
    if (existing) {
      newEducation[index] = { ...existing, [field]: value }
      updateResume('education', newEducation)
    }
  }

  const addCertification = () => {
    const newCertification = {
      name: 'Certification Name',
      issuer: 'Issuing Organization',
      year: '2024',
    }
    updateResume('certifications', [...resume.certifications, newCertification])
  }

  const removeCertification = (index: number) => {
    updateResume(
      'certifications',
      resume.certifications.filter((_, i) => i !== index),
    )
  }

  const updateCertification = (index: number, field: string, value: string) => {
    const newCertifications = [...resume.certifications]
    const existing = newCertifications[index]
    if (existing) {
      newCertifications[index] = { ...existing, [field]: value }
      updateResume('certifications', newCertifications)
    }
  }

  const addCompetencyCategory = () => {
    const category = prompt('Enter category name:')
    if (category) {
      updateResume('competencies', { ...resume.competencies, [category]: [] })
    }
  }

  const removeCompetencyCategory = (category: string) => {
    const newCompetencies = { ...resume.competencies }
    delete newCompetencies[category]
    updateResume('competencies', newCompetencies)
  }

  const addCompetencySkill = (category: string) => {
    const skill = prompt('Enter skill:')
    if (skill) {
      const newCompetencies = { ...resume.competencies }
      newCompetencies[category] = [...(newCompetencies[category] || []), skill]
      updateResume('competencies', newCompetencies)
    }
  }

  const removeCompetencySkill = (category: string, skillIndex: number) => {
    const newCompetencies = { ...resume.competencies }
    const categorySkills = newCompetencies[category]
    if (categorySkills) {
      newCompetencies[category] = categorySkills.filter((_, i) => i !== skillIndex)
      updateResume('competencies', newCompetencies)
    }
  }

  const ResumePreview = () => (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Eye className='w-5 h-5' />
          Resume Preview
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6 max-h-150 overflow-y-auto'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h2 className='text-2xl font-bold text-cyan-400'>{resume.name}</h2>
          <p className='text-lg text-muted-foreground'>{resume.title}</p>
          <div className='flex flex-wrap justify-center gap-4 text-sm text-muted-foreground'>
            {resume.contact.email && (
              <div className='flex items-center gap-1'>
                <Mail className='w-4 h-4' />
                {resume.contact.email}
              </div>
            )}
            {resume.contact.linkedin && (
              <div className='flex items-center gap-1'>
                <Linkedin className='w-4 h-4' />
                {resume.contact.linkedin}
              </div>
            )}
            {resume.contact.website && (
              <div className='flex items-center gap-1'>
                <Globe className='w-4 h-4' />
                {resume.contact.website}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div>
            <h3 className='text-lg font-semibold mb-2 flex items-center gap-2'>
              <User className='w-4 h-4' />
              Professional Summary
            </h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>{resume.summary}</p>
          </div>
        )}

        {/* Competencies */}
        {Object.keys(resume.competencies).length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <Sparkles className='w-4 h-4' />
              Competencies
            </h3>
            <div className='space-y-3'>
              {Object.entries(resume.competencies).map(([category, skills]) => (
                <div key={category}>
                  <h4 className='font-medium text-sm mb-2 text-cyan-400'>{category}</h4>
                  <div className='flex flex-wrap gap-2'>
                    {skills.map((skill, _index) => (
                      <Badge key={skill} variant='secondary' className='text-xs'>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <Briefcase className='w-4 h-4' />
              Experience
            </h3>
            <div className='space-y-4'>
              {resume.experience.map((exp, _index) => (
                <div key={exp.title + exp.company} className='border-l-2 border-cyan-400 pl-4'>
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h4 className='font-semibold'>{exp.title}</h4>
                      <p className='text-cyan-400'>{exp.company}</p>
                    </div>
                    <span className='text-sm text-muted-foreground'>{exp.date}</span>
                  </div>
                  {exp.achievements.length > 0 && (
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {exp.achievements.map((achievement, _i) => (
                        <li key={achievement} className='flex items-start gap-2'>
                          <ChevronRight className='w-3 h-3 mt-0.5 text-cyan-400 shrink-0' />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <GraduationCap className='w-4 h-4' />
              Education
            </h3>
            <div className='space-y-3'>
              {resume.education.map((edu, _index) => (
                <div key={edu.degree + edu.institution}>
                  <h4 className='font-semibold'>{edu.degree}</h4>
                  <p className='text-cyan-400'>{edu.institution}</p>
                  <p className='text-sm text-muted-foreground'>{edu.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <Award className='w-4 h-4' />
              Certifications
            </h3>
            <div className='space-y-2'>
              {resume.certifications.map((cert, _index) => (
                <div key={cert.name + cert.issuer} className='flex justify-between items-center'>
                  <div>
                    <h4 className='font-semibold'>{cert.name}</h4>
                    <p className='text-cyan-400 text-sm'>{cert.issuer}</p>
                  </div>
                  <span className='text-sm text-muted-foreground'>{cert.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <ResumeErrorBoundary>
      <div className='min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden'>
        {/* Circuit background */}
        <CircuitBackground />

        {/* Navigation */}
        <Navigation />

        <div className='relative z-10 min-h-screen'>
          <div className='container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20'>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
              <div className='flex items-center gap-4'>
                <Link to='/'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-white/10 border-white/20 text-white hover:bg-white/20'
                  >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Home
                  </Button>
                </Link>
                <div>
                  <h1 className='text-3xl font-bold text-white'>Resume Builder</h1>
                  <p className='text-white/70 text-sm mt-1'>
                    Create a professional resume with live preview
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowPreview(!showPreview)}
                  className='bg-white/10 border-white/20 text-white hover:bg-white/20'
                >
                  {showPreview ? (
                    <EyeOff className='w-4 h-4 mr-2' />
                  ) : (
                    <Eye className='w-4 h-4 mr-2' />
                  )}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    localStorage.setItem('resume-draft', JSON.stringify(resume))
                    toast.success('Resume saved locally')
                    setHasUnsavedChanges(false)
                  }}
                  className='bg-white/10 border-white/20 text-white hover:bg-white/20'
                >
                  <Save className='w-4 h-4 mr-2' />
                  Save Draft
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className='bg-cyan-400 hover:bg-cyan-500 text-white'
                >
                  <Download className='w-4 h-4 mr-2' />
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
            </div>

            {hasUnsavedChanges && (
              <div className='mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg'>
                <p className='text-yellow-200 text-sm'>
                  You have unsaved changes. They will be auto-saved in 2 seconds.
                </p>
              </div>
            )}

            <div
              className={`grid gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
            >
              {/* Form Section */}
              <div className={showPreview ? '' : 'max-w-4xl mx-auto'}>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='w-5 h-5' />
                      Resume Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className='grid w-full grid-cols-5'>
                        <TabsTrigger value='personal'>Personal</TabsTrigger>
                        <TabsTrigger value='experience'>Experience</TabsTrigger>
                        <TabsTrigger value='education'>Education</TabsTrigger>
                        <TabsTrigger value='certifications'>Certifications</TabsTrigger>
                        <TabsTrigger value='competencies'>Skills</TabsTrigger>
                      </TabsList>

                      <TabsContent value='personal' className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='name'>Full Name *</Label>
                            <Input
                              id='name'
                              value={resume.name}
                              onChange={(e) => updateResume('name', e.target.value)}
                              placeholder='Enter your full name'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='title'>Professional Title *</Label>
                            <Input
                              id='title'
                              value={resume.title}
                              onChange={(e) => updateResume('title', e.target.value)}
                              placeholder='e.g., Software Engineer'
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <div className='space-y-2'>
                            <Label htmlFor='email' className='flex items-center gap-1'>
                              <Mail className='w-4 h-4' />
                              Email
                            </Label>
                            <Input
                              id='email'
                              type='email'
                              value={resume.contact.email || ''}
                              onChange={(e) => updateContact('email', e.target.value)}
                              placeholder='tbaltzakis@cloudless.gr'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='linkedin' className='flex items-center gap-1'>
                              <Linkedin className='w-4 h-4' />
                              LinkedIn
                            </Label>
                            <Input
                              id='linkedin'
                              value={resume.contact.linkedin || ''}
                              onChange={(e) => updateContact('linkedin', e.target.value)}
                              placeholder='username'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='website' className='flex items-center gap-1'>
                              <Globe className='w-4 h-4' />
                              Website
                            </Label>
                            <Input
                              id='website'
                              value={resume.contact.website || ''}
                              onChange={(e) => updateContact('website', e.target.value)}
                              placeholder='https://yourwebsite.com'
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='summary'>Professional Summary *</Label>
                          <Textarea
                            id='summary'
                            rows={4}
                            value={resume.summary}
                            onChange={(e) => updateResume('summary', e.target.value)}
                            placeholder='Write a compelling professional summary highlighting your key strengths and experience...'
                          />
                          <p className='text-xs text-muted-foreground'>
                            {resume.summary.length}/500 characters
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value='experience' className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-lg font-semibold'>Work Experience</h3>
                          <Button
                            onClick={addExperience}
                            size='sm'
                            className='bg-cyan-400 hover:bg-cyan-500'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Add Experience
                          </Button>
                        </div>

                        {resume.experience.map((exp, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Using index as key for static resume data
                          <Card key={`exp-${index}`}>
                            <CardHeader className='pb-3'>
                              <div className='flex justify-between items-start'>
                                <CardTitle className='text-base'>Experience {index + 1}</CardTitle>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() => removeExperience(index)}
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                  <Label>Job Title *</Label>
                                  <Input
                                    value={exp.title}
                                    onChange={(e) =>
                                      updateExperience(index, 'title', e.target.value)
                                    }
                                    placeholder='e.g., Senior Developer'
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <Label>Company *</Label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateExperience(index, 'company', e.target.value)
                                    }
                                    placeholder='e.g., Tech Corp | Location'
                                  />
                                </div>
                              </div>
                              <div className='space-y-2'>
                                <Label>Date Range *</Label>
                                <Input
                                  value={exp.date}
                                  onChange={(e) => updateExperience(index, 'date', e.target.value)}
                                  placeholder='e.g., January 2022 - Present'
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label>Key Achievements</Label>
                                <Textarea
                                  rows={3}
                                  value={exp.achievements.join('\n')}
                                  onChange={(e) => {
                                    const achievements = e.target.value
                                      .split('\n')
                                      .filter((a) => a.trim())
                                    updateExperience(index, 'achievements', achievements)
                                  }}
                                  placeholder='List your key achievements (one per line)...'
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {resume.experience.length === 0 && (
                          <div className='text-center py-8 text-muted-foreground'>
                            <Briefcase className='w-12 h-12 mx-auto mb-4 opacity-50' />
                            <p>No work experience added yet.</p>
                            <Button onClick={addExperience} className='mt-4' variant='outline'>
                              <Plus className='w-4 h-4 mr-2' />
                              Add Your First Experience
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value='education' className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-lg font-semibold'>Education</h3>
                          <Button
                            onClick={addEducation}
                            size='sm'
                            className='bg-cyan-400 hover:bg-cyan-500'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Add Education
                          </Button>
                        </div>

                        {resume.education.map((edu, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Using index as key for static resume data
                          <Card key={`edu-${index}`}>
                            <CardHeader className='pb-3'>
                              <div className='flex justify-between items-start'>
                                <CardTitle className='text-base'>Education {index + 1}</CardTitle>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() => removeEducation(index)}
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                              <div className='space-y-2'>
                                <Label>Degree *</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  placeholder='e.g., Bachelor of Science in Computer Science'
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label>Institution *</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) =>
                                    updateEducation(index, 'institution', e.target.value)
                                  }
                                  placeholder='e.g., University Name | Location'
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label>Date *</Label>
                                <Input
                                  value={edu.date}
                                  onChange={(e) => updateEducation(index, 'date', e.target.value)}
                                  placeholder='e.g., 2007 - 2011'
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {resume.education.length === 0 && (
                          <div className='text-center py-8 text-muted-foreground'>
                            <GraduationCap className='w-12 h-12 mx-auto mb-4 opacity-50' />
                            <p>No education added yet.</p>
                            <Button onClick={addEducation} className='mt-4' variant='outline'>
                              <Plus className='w-4 h-4 mr-2' />
                              Add Education
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value='certifications' className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-lg font-semibold'>Certifications</h3>
                          <Button
                            onClick={addCertification}
                            size='sm'
                            className='bg-cyan-400 hover:bg-cyan-500'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Add Certification
                          </Button>
                        </div>

                        {resume.certifications.map((cert, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Using index as key for static resume data
                          <Card key={`cert-${index}`}>
                            <CardHeader className='pb-3'>
                              <div className='flex justify-between items-start'>
                                <CardTitle className='text-base'>
                                  Certification {index + 1}
                                </CardTitle>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() => removeCertification(index)}
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                              <div className='space-y-2'>
                                <Label>Certification Name *</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) =>
                                    updateCertification(index, 'name', e.target.value)
                                  }
                                  placeholder='e.g., AWS Certified Solutions Architect'
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label>Issuer *</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) =>
                                    updateCertification(index, 'issuer', e.target.value)
                                  }
                                  placeholder='e.g., Amazon Web Services'
                                />
                              </div>
                              <div className='space-y-2'>
                                <Label>Year *</Label>
                                <Input
                                  value={cert.year}
                                  onChange={(e) =>
                                    updateCertification(index, 'year', e.target.value)
                                  }
                                  placeholder='e.g., 2023'
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {resume.certifications.length === 0 && (
                          <div className='text-center py-8 text-muted-foreground'>
                            <Award className='w-12 h-12 mx-auto mb-4 opacity-50' />
                            <p>No certifications added yet.</p>
                            <Button onClick={addCertification} className='mt-4' variant='outline'>
                              <Plus className='w-4 h-4 mr-2' />
                              Add Certification
                            </Button>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value='competencies' className='space-y-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-lg font-semibold'>Skills & Competencies</h3>
                          <Button
                            onClick={addCompetencyCategory}
                            size='sm'
                            className='bg-cyan-400 hover:bg-cyan-500'
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            Add Category
                          </Button>
                        </div>

                        {Object.keys(resume.competencies).length === 0 ? (
                          <div className='text-center py-8 text-muted-foreground'>
                            <Sparkles className='w-12 h-12 mx-auto mb-4 opacity-50' />
                            <p>No skill categories added yet.</p>
                            <Button
                              onClick={addCompetencyCategory}
                              className='mt-4'
                              variant='outline'
                            >
                              <Plus className='w-4 h-4 mr-2' />
                              Add Your First Skill Category
                            </Button>
                          </div>
                        ) : (
                          <div className='space-y-6'>
                            {Object.entries(resume.competencies).map(([category, skills]) => (
                              <Card key={category}>
                                <CardHeader className='pb-3'>
                                  <div className='flex justify-between items-start'>
                                    <CardTitle className='text-base'>{category}</CardTitle>
                                    <div className='flex gap-2'>
                                      <Button
                                        size='sm'
                                        variant='outline'
                                        onClick={() => addCompetencySkill(category)}
                                      >
                                        <Plus className='w-4 h-4' />
                                      </Button>
                                      <Button
                                        variant='destructive'
                                        size='sm'
                                        onClick={() => removeCompetencyCategory(category)}
                                      >
                                        <Trash2 className='w-4 h-4' />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className='flex flex-wrap gap-2'>
                                    {skills.map((skill, skillIndex) => (
                                      <Badge
                                        key={skill}
                                        variant='secondary'
                                        className='cursor-pointer hover:bg-destructive hover:text-destructive-foreground'
                                        onClick={() => removeCompetencySkill(category, skillIndex)}
                                      >
                                        {skill} ×
                                      </Badge>
                                    ))}
                                  </div>
                                  {skills.length === 0 && (
                                    <p className='text-sm text-muted-foreground mt-2'>
                                      No skills added to this category yet.
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div>
                  <ResumePreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResumeErrorBoundary>
  )
}

export default Resume
