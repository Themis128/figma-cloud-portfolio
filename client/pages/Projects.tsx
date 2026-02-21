import { Grid3X3, Zap } from 'lucide-react'
import type React from 'react'
import { lazy, Suspense, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'

import { useSampleProjects } from '@/components/Interactive3DDemo'
import Navigation from '@/components/Navigation'

const Interactive3DDemo = lazy(() =>
  import('@/components/Interactive3DDemo').then((module) => ({
    default: module.Interactive3DDemo,
  })),
)

import SearchableProjects from '@/components/SearchableProjects'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Projects: React.FC = () => {
  const sampleProjects = useSampleProjects()

  // Calculate project statistics
  const stats = useMemo(() => {
    const totalProjects = sampleProjects.length
    const webApps = sampleProjects.filter((p) => p.category === 'web').length
    const mobileApps = sampleProjects.filter((p) => p.category === 'mobile').length

    return {
      total: totalProjects,
      webApps,
      mobileApps,
    }
  }, [sampleProjects])

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Projects & Portfolio - Themistoklis Baltzakis',
    description:
      'Explore my latest work and technical projects including web applications, AI tools, and mobile apps.',
    url: 'https://themistoklisbaltzakis.com/projects',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Portfolio Projects',
      numberOfItems: stats.total,
      itemListElement: sampleProjects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: project.title,
          description: project.description,
          applicationCategory: project.category,
          programmingLanguage: project.technologies,
          datePublished: project.year.toString(),
        },
      })),
    },
  }

  return (
    <>
      <Helmet>
        <title>Projects & Portfolio - Themistoklis Baltzakis</title>
        <meta
          name='description'
          content='Explore my latest work and technical projects including web applications, AI tools, and mobile apps.'
        />
        <meta
          name='keywords'
          content='portfolio, projects, web development, AI, mobile apps, React, TypeScript'
        />
        <link rel='canonical' href='https://themistoklisbaltzakis.com/projects' />
        <script type='application/ld+json'>{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className='min-h-screen bg-linear-to-br from-slate-900 to-slate-800'>
        <Suspense fallback={<div className='h-16 md:h-20 bg-slate-900/80 backdrop-blur-sm'></div>}>
          <Navigation />
        </Suspense>
        <div className='container mx-auto px-4 py-12'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4'>
              Projects & Portfolio
            </h1>
            <p className='text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto'>
              Explore my latest work and technical projects
            </p>
          </div>

          {/* Project Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
            <Card>
              <CardHeader className='text-center'>
                <CardTitle className='text-3xl font-bold text-blue-600'>{stats.total}</CardTitle>
                <CardDescription>Projects</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className='text-center'>
                <CardTitle className='text-3xl font-bold text-green-600'>{stats.webApps}</CardTitle>
                <CardDescription>Web Apps</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className='text-center'>
                <CardTitle className='text-3xl font-bold text-purple-600'>
                  {stats.mobileApps}
                </CardTitle>
                <CardDescription>Mobile App</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Project Views */}
          <Tabs defaultValue='grid' className='w-full'>
            <TabsList className='grid w-full max-w-md mx-auto grid-cols-2 mb-8'>
              <TabsTrigger value='grid' className='flex items-center gap-2'>
                <Grid3X3 className='h-4 w-4' />
                Grid View
              </TabsTrigger>
              <TabsTrigger value='3d' className='flex items-center gap-2'>
                <Zap className='h-4 w-4' />
                3D Demo
              </TabsTrigger>
            </TabsList>

            <TabsContent value='grid' className='mt-8'>
              <SearchableProjects projects={sampleProjects} />
            </TabsContent>

            <TabsContent value='3d' className='mt-8'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-3'>
                    <Zap className='h-5 w-5 text-blue-600' />
                    Interactive 3D Portfolio Demo
                  </CardTitle>
                  <CardDescription>
                    Experience my projects in an immersive 3D environment. Click and drag to rotate,
                    scroll to zoom.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className='w-full h-96 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400'>
                        Loading 3D Demo...
                      </div>
                    }
                  >
                    <Interactive3DDemo
                      projects={sampleProjects}
                      className='w-full h-96 rounded-lg overflow-hidden'
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default Projects
