import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedSection } from '@/components/AnimatedSection'
import { RealtimeTest } from '@/components/RealtimeTest'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatedSection>
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground">Customize your experience and preferences</p>
          </div>
        </AnimatedSection>

        <div className="space-y-6">
          {/* Theme Settings */}
          <AnimatedSection delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Theme</Label>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="cursor-pointer">
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="cursor-pointer">
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="cursor-pointer">
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme or let the system decide
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch checked={animations} onCheckedChange={setAnimations} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Notification Settings */}
          <AnimatedSection delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about updates and new features
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Privacy Settings */}
          <AnimatedSection delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control your privacy and data settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Data Management</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                    <Button variant="outline" size="sm">
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* About */}
          <AnimatedSection delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Application information and version details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Version</Label>
                    <p className="text-muted-foreground">1.0.0</p>
                  </div>
                  <div>
                    <Label className="font-medium">Build</Label>
                    <p className="text-muted-foreground">2024.01.19</p>
                  </div>
                  <div>
                    <Label className="font-medium">Framework</Label>
                    <p className="text-muted-foreground">React + Vite</p>
                  </div>
                  <div>
                    <Label className="font-medium">PWA</Label>
                    <p className="text-muted-foreground">Enabled</p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Check for Updates
                  </Button>
                  <Button variant="outline" size="sm">
                    View Changelog
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Real-time Features Test */}
          <AnimatedSection delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Real-time Features (Beta)</CardTitle>
                <CardDescription>Test WebSocket connections and real-time functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <RealtimeTest />
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}