
import { Link } from 'wouter';
import {
  HelpCircle,
  FileQuestion,
  UserCog,
  Upload,
  Copyright,
  Shield,
  AlertTriangle,
  LifeBuoy,
  HeartHandshake
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="flex items-center gap-2 mb-8">
        <HelpCircle className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Help Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <HelpCard 
          title="Getting Started" 
          icon={<FileQuestion className="h-5 w-5" />}
          items={[
            { label: "Creating an account", href: "#account" },
            { label: "Navigating the platform", href: "#navigation" },
            { label: "Watching videos", href: "#watching" },
            { label: "Engaging with content", href: "#engagement" },
          ]} 
        />
        
        <HelpCard 
          title="Account & Settings" 
          icon={<UserCog className="h-5 w-5" />}
          items={[
            { label: "Managing your profile", href: "#profile" },
            { label: "Privacy settings", href: "#privacy" },
            { label: "Notification preferences", href: "#notifications" },
            { label: "Deleting your account", href: "#deletion" },
          ]} 
        />
        
        <HelpCard 
          title="Uploading Content" 
          icon={<Upload className="h-5 w-5" />}
          items={[
            { label: "Video requirements", href: "#requirements" },
            { label: "Upload process", href: "#upload" },
            { label: "Managing your videos", href: "#manage" },
            { label: "Content guidelines", href: "#guidelines" },
          ]} 
        />
        
        <HelpCard 
          title="Policies & Safety" 
          icon={<Shield className="h-5 w-5" />}
          items={[
            { label: "Community guidelines", href: "#community" },
            { label: "Copyright information", href: "#copyright" },
            { label: "Reporting content", href: "#reporting" },
            { label: "Safety resources", href: "#safety" },
          ]} 
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I create an account?</AccordionTrigger>
            <AccordionContent>
              Click the "Sign In" button in the top right corner and then select "Create Account" from the login page. Follow the prompts to create your new account with a username, email, and secure password.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>How do I upload videos?</AccordionTrigger>
            <AccordionContent>
              After signing in, click the upload button in the top navigation bar. Follow the on-screen instructions to select your video file, add a title, description, and thumbnail, then publish your content.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>What video formats are supported?</AccordionTrigger>
            <AccordionContent>
              We support most common video formats including MP4, MOV, AVI, and WebM. For best quality and compatibility, we recommend using MP4 with H.264 encoding at 1080p resolution.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>How can I report inappropriate content?</AccordionTrigger>
            <AccordionContent>
              If you encounter content that violates our community guidelines, click the three dots menu beneath the video and select "Report." Follow the prompts to specify the reason for your report.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>How do I change my password?</AccordionTrigger>
            <AccordionContent>
              Go to your account settings by clicking your profile picture in the top right, then select "Settings." From there, navigate to the "Security" tab where you can update your password.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-card rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Need more help?</h2>
        </div>
        <p className="mb-4">If you couldn't find the answer to your question, our support team is here to help.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/feedback">
            <a className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md">
              <LifeBuoy className="h-4 w-4" />
              Contact Support
            </a>
          </Link>
          <Link href="/community">
            <a className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2 rounded-md">
              <HeartHandshake className="h-4 w-4" />
              Community Forum
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface HelpCardProps {
  title: string;
  icon: React.ReactNode;
  items: { label: string; href: string }[];
}

function HelpCard({ title, icon, items }: HelpCardProps) {
  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.href}>
              <a className="text-primary hover:underline flex items-center gap-1">
                <span className="text-xs">•</span>
                {item.label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}