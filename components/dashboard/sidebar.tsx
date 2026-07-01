'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  CalendarDays,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Users,
  LayoutGrid,
  GitBranch,
  Zap,
  BarChart3,
  ExternalLink,
  Copy,
  Gift,
  Search,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { toast } from 'sonner'

const mainNavItems = [
  { href: '/dashboard/event-types', label: 'Event Types', icon: CalendarDays },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar },
  { href: '/dashboard/availability', label: 'Availability', icon: Clock },
]

const advancedNavItems = [
  { href: '/dashboard/teams', label: 'Teams', icon: Users },
  { href: '/dashboard/routing', label: 'Routing', icon: GitBranch },
  { href: '/dashboard/workflows', label: 'Workflows', icon: Zap },
]

const collapsibleItems = {
  apps: [
    { href: '/dashboard/apps', label: 'App Store' },
  ],
  insights: [
    { href: '/dashboard/insights', label: 'Overview' },
  ],
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [appsOpen, setAppsOpen] = React.useState(false)
  const [insightsOpen, setInsightsOpen] = React.useState(false)

  const userName = session?.user?.name ?? 'User'
  const userEmail = session?.user?.email ?? ''
  const userImage = session?.user?.image ?? ''
  const userSlug = userName.toLowerCase().replace(/\s+/g, '')

  const copyPublicLink = () => {
    const link = `${window.location.origin}/${userSlug}`
    navigator.clipboard.writeText(link)
    toast.success('Public link copied to clipboard')
  }

  const NavLink = ({
    href,
    icon: Icon,
    label,
    isActive,
  }: {
    href: string
    icon: React.ElementType
    label: string
    isActive: boolean
  }) => {
    const linkContent = (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* User Profile Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'h-auto justify-start gap-2.5 px-2 py-1.5 hover:bg-sidebar-accent/50',
                  collapsed && 'justify-center px-1'
                )}
              >
                <Avatar className="size-7">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                    {userName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-sidebar-muted truncate max-w-[140px]">
                        {userEmail}
                      </span>
                    )}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {session?.user && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <Search className="size-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {/* Main Section */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                />
              )
            })}
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-sidebar-border" />

          {/* Advanced Section */}
          <div className="space-y-1">
            {advancedNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                />
              )
            })}

            {/* Apps Collapsible */}
            {!collapsed && (
              <Collapsible open={appsOpen} onOpenChange={setAppsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="size-[18px]" />
                      <span>Apps</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-200',
                        appsOpen && 'rotate-180'
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-9 pt-1">
                  {collapsibleItems.apps.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-1.5 text-sm text-sidebar-muted transition-colors hover:text-sidebar-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/apps"
                    className="flex items-center justify-center rounded-lg px-2 py-2 text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50"
                  >
                    <LayoutGrid className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Apps
                </TooltipContent>
              </Tooltip>
            )}

            {/* Insights Collapsible */}
            {!collapsed && (
              <Collapsible open={insightsOpen} onOpenChange={setInsightsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="size-[18px]" />
                      <span>Insights</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-200',
                        insightsOpen && 'rotate-180'
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-9 pt-1">
                  {collapsibleItems.insights.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-1.5 text-sm text-sidebar-muted transition-colors hover:text-sidebar-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/insights"
                    className="flex items-center justify-center rounded-lg px-2 py-2 text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50"
                  >
                    <BarChart3 className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Insights
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </nav>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-16 z-50 size-6 rounded-full border border-border bg-card shadow-sm hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronLeft className="size-3" />
          )}
        </Button>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          {!collapsed ? (
            <>
              <Link
                href={`/${userSlug}`}
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
              >
                <ExternalLink className="size-[18px]" />
                <span>View public page</span>
              </Link>
              <button
                onClick={copyPublicLink}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
              >
                <Copy className="size-[18px]" />
                <span>Copy public page link</span>
              </button>
              <Link
                href="/dashboard/referrals"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
              >
                <Gift className="size-[18px]" />
                <span>Refer and earn</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
              >
                <Settings className="size-[18px]" />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/${userSlug}`}
                    target="_blank"
                    className="flex items-center justify-center rounded-lg px-2 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
                  >
                    <ExternalLink className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  View public page
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyPublicLink}
                    className="flex w-full items-center justify-center rounded-lg px-2 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
                  >
                    <Copy className="size-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Copy public link
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center justify-center rounded-lg px-2 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
                  >
                    <Settings className="size-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Settings
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
