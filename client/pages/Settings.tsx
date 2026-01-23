import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AnimatedSection } from "@/components/AnimatedSection";
import Navigation from "@/components/Navigation";
import { RealtimeTest } from "@/components/RealtimeTest";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "available" | "up-to-date" | "error"
  >("idle");
  const [updateMessage, setUpdateMessage] = useState("");

  const checkForUpdates = async () => {
    setUpdateStatus("checking");
    setUpdateMessage("Checking for updates...");

    try {
      // Simulate API call to check for updates
      // In a real app, this would call your backend API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if service worker has updates available
      if ("serviceWorker" in navigator && "controller" in navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.ready;

        // Check if there's a waiting service worker (update available)
        if (registration.waiting) {
          setUpdateStatus("available");
          setUpdateMessage("A new version is available! Refresh to update.");
          return;
        }

        // Check for updates by calling update()
        registration
          .update()
          .then(() => {
            if (registration.installing) {
              setUpdateStatus("checking");
              setUpdateMessage("Downloading update...");
            } else {
              setUpdateStatus("up-to-date");
              setUpdateMessage("You're running the latest version.");
            }
          })
          .catch(() => {
            setUpdateStatus("error");
            setUpdateMessage("Failed to check for updates.");
          });
      } else {
        // Fallback: simulate version check
        const currentVersion = "1.0.0";
        const latestVersion = "1.0.0"; // In real app, fetch from API

        if (currentVersion === latestVersion) {
          setUpdateStatus("up-to-date");
          setUpdateMessage("You're running the latest version.");
        } else {
          setUpdateStatus("available");
          setUpdateMessage(`Version ${latestVersion} is available!`);
        }
      }
    } catch (error) {
      setUpdateStatus("error");
      setUpdateMessage("Failed to check for updates. Please try again.");
      console.error("Update check failed:", error);
    }
  };

  const viewChangelog = () => {
    // Open GitHub releases page for the portfolio repository
    window.open("https://github.com/Themis128/figma-cloud-portfolio/releases", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatedSection>
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                navigate(-1);
              }}
              className="mb-4"
            >
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
                    onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
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

                {updateMessage && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      updateStatus === "available"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : updateStatus === "up-to-date"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : updateStatus === "error"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "bg-gray-50 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {updateMessage}
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkForUpdates}
                    disabled={updateStatus === "checking"}
                  >
                    {updateStatus === "checking" ? "Checking..." : "Check for Updates"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={viewChangelog}>
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
                <CardDescription>
                  Test WebSocket connections and real-time functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealtimeTest />
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
