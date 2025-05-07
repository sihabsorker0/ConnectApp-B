import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info, Save, Trash2, Upload, Database, Globe, Shield, BellRing, Server, Mail } from 'lucide-react';

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings for the platform</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic information about your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" placeholder="VidVault" defaultValue="VidVault" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input id="site-url" placeholder="https://vidvault.com" defaultValue="https://vidvault.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea 
                  id="site-description" 
                  placeholder="A modern video sharing platform" 
                  defaultValue="A modern video sharing platform with an advanced UI that improves upon YouTube's design" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input id="admin-email" placeholder="admin@vidvault.com" defaultValue="admin@vidvault.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" placeholder="support@vidvault.com" defaultValue="support@vidvault.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
              <CardDescription>
                Configure how users can register on your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable new user registrations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">Require admin approval for new accounts</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Video Settings */}
        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Upload Settings</CardTitle>
              <CardDescription>
                Configure video upload and processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                  <Input id="max-file-size" type="number" defaultValue="1024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-formats">Allowed Video Formats</Label>
                  <Input id="allowed-formats" defaultValue="mp4,mov,avi,webm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-duration">Maximum Duration (minutes)</Label>
                  <Input id="max-duration" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-quality">Default Processing Quality</Label>
                  <Select defaultValue="1080p">
                    <SelectTrigger id="default-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="1440p">1440p (2K)</SelectItem>
                      <SelectItem value="2160p">2160p (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Generate Thumbnails</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate video thumbnails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">Automatically scan videos for inappropriate content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comment Settings</CardTitle>
              <CardDescription>
                Configure video comment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Comments</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable comments across the platform</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Comment Moderation</Label>
                    <p className="text-sm text-muted-foreground">Hold comments for review before publishing</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Spam Filtering</Label>
                    <p className="text-sm text-muted-foreground">Automatically filter spam comments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Configure the look and feel of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 cursor-pointer bg-background flex flex-col items-center space-y-2 border-primary">
                    <div className="w-full h-20 rounded bg-background border"></div>
                    <span className="text-sm">Light</span>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer bg-background flex flex-col items-center space-y-2">
                    <div className="w-full h-20 rounded bg-black border border-gray-800"></div>
                    <span className="text-sm">Dark</span>
                  </div>
                  <div className="border rounded-md p-3 cursor-pointer bg-background flex flex-col items-center space-y-2">
                    <div className="w-full h-20 rounded bg-gradient-to-b from-white to-black border"></div>
                    <span className="text-sm">System</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  <div className="border rounded-md p-2 cursor-pointer bg-red-500 h-10 border-primary"></div>
                  <div className="border rounded-md p-2 cursor-pointer bg-blue-500 h-10"></div>
                  <div className="border rounded-md p-2 cursor-pointer bg-green-500 h-10"></div>
                  <div className="border rounded-md p-2 cursor-pointer bg-purple-500 h-10"></div>
                  <div className="border rounded-md p-2 cursor-pointer bg-yellow-500 h-10"></div>
                  <div className="border rounded-md p-2 cursor-pointer bg-pink-500 h-10"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Site Logo</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-40 h-12 border rounded flex items-center justify-center bg-muted">
                      <span className="text-sm text-muted-foreground">Current Logo</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-upload">Favicon</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 border rounded flex items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">Icon</span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Homepage Layout</CardTitle>
              <CardDescription>
                Configure the layout of your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Featured Sections</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="featured-videos" defaultChecked />
                    <Label htmlFor="featured-videos">Featured Videos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="trending-section" defaultChecked />
                    <Label htmlFor="trending-section">Trending Section</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="categories-section" defaultChecked />
                    <Label htmlFor="categories-section">Categories</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="recommended-channels" />
                    <Label htmlFor="recommended-channels">Recommended Channels</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videos-per-row">Videos Per Row</Label>
                <Select defaultValue="4">
                  <SelectTrigger id="videos-per-row">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure authentication methods for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Label className="text-base mr-2">Password Authentication</Label>
                      <Badge>Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Standard username/password authentication</p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Google Authentication</Label>
                    <p className="text-sm text-muted-foreground">Allow users to sign in with Google</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Facebook Authentication</Label>
                    <p className="text-sm text-muted-foreground">Allow users to sign in with Facebook</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Twitter Authentication</Label>
                    <p className="text-sm text-muted-foreground">Allow users to sign in with Twitter</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Configure security policies for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-min-length">Minimum Password Length</Label>
                <Input id="password-min-length" type="number" defaultValue="8" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">Require special characters, numbers, and mixed case</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API access for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable API Access</Label>
                    <p className="text-sm text-muted-foreground">Allow external applications to access your platform via API</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require API Keys</Label>
                    <p className="text-sm text-muted-foreground">Require authentication for API access</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="pt-2 pb-4">
                <Label className="text-base">API Key</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input defaultValue="sk_live_12345678901234567890" type="password" />
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-2" /> Reveal
                  </Button>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" /> Generate New
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Your API key provides full access to your account. Keep it secure.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                <Input id="rate-limit" type="number" defaultValue="60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure storage settings for your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Storage Provider</Label>
                <Select defaultValue="local">
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="cloudflare">Cloudflare R2</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Current Storage Usage</Label>
                  <Badge className="ml-2">426.5 GB / 1 TB</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '42.65%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">42.65% of your storage allocation is used.</p>
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Automatic Cleanup</Label>
                    <p className="text-sm text-muted-foreground">Automatically delete unused temporary files</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">CDN Caching</Label>
                    <p className="text-sm text-muted-foreground">Cache files on CDN for faster delivery</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="text-red-500" disabled>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cache
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Storage Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                View and manage system information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>System Version</Label>
                    </div>
                    <p className="text-sm ml-6">VidVault v1.5.2</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Database Status</Label>
                    </div>
                    <p className="text-sm ml-6 text-green-500">Connected</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Email Service</Label>
                    </div>
                    <p className="text-sm ml-6 text-green-500">Active</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <BellRing className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Notification Service</Label>
                    </div>
                    <p className="text-sm ml-6 text-green-500">Active</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Security Status</Label>
                    </div>
                    <p className="text-sm ml-6 text-green-500">Protected</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Label>Server Location</Label>
                    </div>
                    <p className="text-sm ml-6">US-East (Virginia)</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>System Logs</Label>
                  <div className="bg-muted rounded-md p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-muted-foreground">
{`[2023-05-05 09:15:32] INFO: System started successfully
[2023-05-05 09:15:33] INFO: Database connection established
[2023-05-05 09:15:34] INFO: Email service initialized
[2023-05-05 09:15:35] INFO: Storage service initialized
[2023-05-05 09:15:36] INFO: User authentication service started
[2023-05-05 09:15:37] INFO: Video processing service started
[2023-05-05 09:15:38] INFO: API service initialized
[2023-05-05 09:15:39] INFO: All services are running normally
[2023-05-05 09:30:15] INFO: User login: admin (ID: 1)
[2023-05-05 10:15:22] INFO: New video uploaded: ID 1245
[2023-05-05 10:45:10] INFO: Video processing completed: ID 1245`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Download System Report
              </Button>
              <Button variant="destructive" disabled>
                Reset System
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
