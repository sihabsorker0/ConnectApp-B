
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationsDropdown() {
  // This would typically come from an API
  const notifications = [
    {
      id: 1,
      title: "New comment on your video",
      message: "Someone commented on your video",
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "New subscriber",
      message: "Someone subscribed to your channel",
      time: "5 hours ago"
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-center">
            No new notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-4">
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm text-muted-foreground">{notification.message}</div>
              <div className="text-xs text-muted-foreground">{notification.time}</div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
