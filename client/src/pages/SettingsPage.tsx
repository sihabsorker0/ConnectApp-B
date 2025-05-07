import { useState } from 'react';
import type { Theme } from '@/hooks/use-theme';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, User, AlertCircle, Bell, ShieldCheck, Eye, Moon, Sun } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Profile settings form schema
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  avatar: z.string().url('Please enter a valid URL').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

// Password change form schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  // Notification settings state
  const [notifications, setNotifications] = useState({
    newVideos: true,
    comments: true,
    subscriptions: true,
    mentions: false,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    historyPause: false,
    privatePlaylists: true,
    restrictedMode: false,
  });

  // Profile settings form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      avatar: user?.avatar || '',
      description: user?.description || '',
    },
  });

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest('PATCH', '/api/user/profile', data);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['/api/user'], updatedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest('POST', '/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password changed',
        description: 'Your password has been successfully changed.',
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Password change failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onUpdateProfile = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onChangePassword = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access settings. Please sign in or create an account.
          </AlertDescription>
          <div className="mt-4">
            <Button onClick={() => navigate('/auth')}>Sign In / Register</Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || ''} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.displayName}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
              <p className="text-muted-foreground text-sm mt-1">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={updateProfileMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={updateProfileMutation.isPending} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL of an image to use as your profile picture.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={updateProfileMutation.isPending} 
                          className="min-h-32 resize-y"
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your channel to help viewers understand what type of content you create.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          disabled={changePasswordMutation.isPending} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          disabled={changePasswordMutation.isPending} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          disabled={changePasswordMutation.isPending} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Change Password'}
                </Button>
              </form>
            </Form>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Account Management</h3>
            <div className="space-y-3">
              <Button 
                variant="destructive" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : 'Sign Out'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Videos from Subscriptions</p>
                  <p className="text-sm text-muted-foreground">Get notified when channels you subscribe to upload new videos</p>
                </div>
                <Switch 
                  checked={notifications.newVideos} 
                  onCheckedChange={(checked) => setNotifications({...notifications, newVideos: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Comments on Your Videos</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone comments on your videos</p>
                </div>
                <Switch 
                  checked={notifications.comments} 
                  onCheckedChange={(checked) => setNotifications({...notifications, comments: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Subscribers</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone subscribes to your channel</p>
                </div>
                <Switch 
                  checked={notifications.subscriptions} 
                  onCheckedChange={(checked) => setNotifications({...notifications, subscriptions: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mentions</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone mentions you in a comment</p>
                </div>
                <Switch 
                  checked={notifications.mentions} 
                  onCheckedChange={(checked) => setNotifications({...notifications, mentions: checked})}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => {
                toast({
                  title: 'Notification settings saved',
                  description: 'Your notification preferences have been updated.',
                });
              }}>
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pause Watch History</p>
                  <p className="text-sm text-muted-foreground">Stop recording videos you watch</p>
                </div>
                <Switch 
                  checked={privacy.historyPause} 
                  onCheckedChange={(checked) => setPrivacy({...privacy, historyPause: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Playlists</p>
                  <p className="text-sm text-muted-foreground">Make all new playlists private by default</p>
                </div>
                <Switch 
                  checked={privacy.privatePlaylists} 
                  onCheckedChange={(checked) => setPrivacy({...privacy, privatePlaylists: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Restricted Mode</p>
                  <p className="text-sm text-muted-foreground">Hide potentially mature content</p>
                </div>
                <Switch 
                  checked={privacy.restrictedMode} 
                  onCheckedChange={(checked) => setPrivacy({...privacy, restrictedMode: checked})}
                />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={() => {
                toast({
                  title: 'Privacy settings saved',
                  description: 'Your privacy preferences have been updated.',
                });
              }}>
                Save Preferences
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Data & Personalization</h3>
            <div className="space-y-4">
              <Button variant="outline" onClick={() => {
                toast({
                  title: 'Download requested',
                  description: 'Your data export has been requested. You will receive an email when it is ready.',
                });
              }}>
                Download Your Data
              </Button>

              <div className="pt-2">
                <Button variant="destructive" onClick={() => {
                  toast({
                    title: 'Watch history cleared',
                    description: 'Your watch history has been successfully cleared.',
                  });
                }}>
                  Clear Watch History
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5" />
                  <p className="font-medium">Light Theme</p>
                </div>
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  {theme === 'light' && 'Active'}
                  {theme !== 'light' && 'Activate'}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5" />
                  <p className="font-medium">Dark Theme</p>
                </div>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  {theme === 'dark' && 'Active'}
                  {theme !== 'dark' && 'Activate'}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                  <div>
                    <p className="font-medium">System Theme</p>
                    <p className="text-sm text-muted-foreground">Follow your system's theme preference</p>
                  </div>
                </div>
                <Button 
                  variant={!theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme(null as unknown as Theme)}
                >
                  {!theme && 'Active'}
                  {theme && 'Activate'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Interface Density</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="mb-2 space-y-1">
                    <div className="w-full h-4 bg-muted rounded"></div>
                    <div className="w-2/3 h-4 bg-muted rounded"></div>
                  </div>
                  <div className="text-center mt-3">
                    <Badge variant="outline">Default</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="mb-2 space-y-0.5">
                    <div className="w-full h-3 bg-muted rounded"></div>
                    <div className="w-2/3 h-3 bg-muted rounded"></div>
                  </div>
                  <div className="text-center mt-3">
                    <Badge variant="outline">Compact</Badge>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <div className="mb-2 space-y-2">
                    <div className="w-full h-5 bg-muted rounded"></div>
                    <div className="w-2/3 h-5 bg-muted rounded"></div>
                  </div>
                  <div className="text-center mt-3">
                    <Badge variant="outline">Comfortable</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}