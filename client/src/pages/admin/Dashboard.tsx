import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Activity, Film, Users, MessageSquare, Settings, Upload, Eye } from 'lucide-react';
import { formatViews } from '@/lib/constants';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  // Mock stats data
  const stats = [
    {
      title: 'Total Videos',
      value: '742',
      icon: <Film className="h-5 w-5" />,
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: '8,294',
      icon: <Users className="h-5 w-5" />,
      change: '+10.6%',
      changeType: 'positive'
    },
    {
      title: 'Total Views',
      value: formatViews(12450000),
      icon: <Eye className="h-5 w-5" />,
      change: '+8.1%',
      changeType: 'positive'
    },
    {
      title: 'Total Comments',
      value: '5,740',
      icon: <MessageSquare className="h-5 w-5" />,
      change: '+2.4%',
      changeType: 'positive'
    }
  ];

  // Mock recent uploads data
  const recentUploads = [
    {
      id: 1,
      title: 'Building Responsive Web Applications with Modern Frameworks',
      author: 'Tech Reviews',
      views: 254000,
      date: '2023-05-01'
    },
    {
      id: 2,
      title: '10 Coding Tips Every Developer Should Know in 2023',
      author: 'Code Masters',
      views: 120000,
      date: '2023-05-02'
    },
    {
      id: 3,
      title: 'Pro Gaming Tournament Finals - Live Commentary',
      author: 'Gaming Pro',
      views: 87000,
      date: '2023-05-03'
    },
    {
      id: 4,
      title: 'New Electronic Music Mix 2023 - Summer Vibes',
      author: 'Music Trends',
      views: 340000,
      date: '2023-05-04'
    },
    {
      id: 5,
      title: 'Healthy Meal Prep Ideas for Busy Professionals',
      author: 'Cooking Essentials',
      views: 74200,
      date: '2023-05-05'
    }
  ];

  // Mock recent users data
  const recentUsers = [
    {
      id: 1,
      username: 'johndoe',
      displayName: 'John Doe',
      status: 'active',
      videos: 12,
      joinDate: '2023-04-15'
    },
    {
      id: 2,
      username: 'janedoe',
      displayName: 'Jane Doe',
      status: 'active',
      videos: 5,
      joinDate: '2023-04-16'
    },
    {
      id: 3,
      username: 'userxyz',
      displayName: 'User XYZ',
      status: 'inactive',
      videos: 0,
      joinDate: '2023-04-18'
    },
    {
      id: 4,
      username: 'videogamer95',
      displayName: 'Video Gamer 95',
      status: 'active',
      videos: 28,
      joinDate: '2023-04-20'
    },
    {
      id: 5,
      username: 'musicfan123',
      displayName: 'Music Fan 123',
      status: 'active',
      videos: 7,
      joinDate: '2023-04-22'
    }
  ];

  return (
    <div className="p-4 space-y-6 overflow-y-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform statistics and management tools</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button className="flex items-center gap-1" onClick={() => setLocation('/admin/videos/new')}>
            <Upload className="h-4 w-4" /> Upload Video
          </Button>
          <Button variant="outline" className="flex items-center gap-1" onClick={() => setLocation('/admin/settings')}>
            <Settings className="h-4 w-4" /> Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="p-2 bg-secondary/30 rounded-md">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="uploads" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="uploads" className="flex-1 sm:flex-none">
            <Film className="h-4 w-4 mr-2" /> Recent Uploads
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            <Users className="h-4 w-4 mr-2" /> Recent Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 sm:flex-none">
            <Activity className="h-4 w-4 mr-2" /> Platform Activity
          </TabsTrigger>
        </TabsList>
        
        {/* Recent Uploads Tab */}
        <TabsContent value="uploads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Video Uploads</CardTitle>
              <CardDescription>
                A list of recent videos uploaded to the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Author</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentUploads.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-primary truncate max-w-[200px] sm:max-w-[300px]">{video.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{video.author}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatViews(video.views)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{video.date}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setLocation('/admin/videos')}>View All Videos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recent Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Registrations</CardTitle>
              <CardDescription>
                A list of recently registered users on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Videos</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Join Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-primary">{user.displayName}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.videos}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100">
                              Ban
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setLocation('/admin/users')}>View All Users</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Platform Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>
                Recent platform-wide activities and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-secondary rounded-full">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New video uploaded: "Building Responsive Web Applications"</p>
                    <p className="text-sm text-muted-foreground">Tech Reviews • 30 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-secondary rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New user registered: John Doe</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-secondary rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Comment moderation flag: Inappropriate content</p>
                    <p className="text-sm text-muted-foreground">Video: "Pro Gaming Tournament" • 5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-secondary rounded-full">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Traffic spike detected: 250% increase in views</p>
                    <p className="text-sm text-muted-foreground">Category: Music • 12 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-secondary rounded-full">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System maintenance completed</p>
                    <p className="text-sm text-muted-foreground">Duration: 15 minutes • 1 day ago</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setLocation('/admin/activities')}>View All Activity</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
