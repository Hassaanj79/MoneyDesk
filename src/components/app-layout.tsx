
"use client";

import React, from "react";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRightLeft,
  BarChart3,
  Bell,
  LayoutDashboard,
  Search,
  Settings,
  Target,
  Wallet,
  Clock,
  CreditCard,
  X,
  Loader2,
  History
} from "lucide-react";
import { Logo } from "@/components/icons/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DateRangePicker } from "@/components/date-range-picker";
import { useDateRange } from "@/contexts/date-range-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { transactions as allTransactions } from "@/lib/data";
import { searchTransactions } from "@/ai/flows/search";
import type { Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { RecapStory } from "@/components/dashboard/recap-story";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { date, setDate } = useDateRange();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Omit<Transaction, 'categoryIcon'>[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = React.useState(false);
  const [recapOpen, setRecapOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { notifications, markAllAsRead } = useNotifications();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/budgets", label: "Budgets", icon: Target },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const pageTitles: { [key: string]: string } = {
    "/": "Dashboard",
    "/transactions": "Transactions",
    "/accounts": "Accounts",
    "/budgets": "Budgets",
    "/reports": "Reports",
    "/settings": "Settings",
  };

  const currentPageTitle = pageTitles[pathname] || "Dashboard";

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchPopoverOpen(false);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      setSearchPopoverOpen(true);
      try {
        // Remove categoryIcon before sending to the server
        const transactionsToSearch = allTransactions.map(({ categoryIcon, ...rest }) => rest);
        
        const response = await searchTransactions({
          query: searchQuery,
          transactions: transactionsToSearch,
        });
        setSearchResults(response.results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchPopoverOpen(false);
  };
  
  const MainContent = (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-30">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-lg font-semibold md:text-xl hidden sm:block">
          {currentPageTitle}
        </h1>
        <div className="flex-1" />
        <DateRangePicker date={date} onDateChange={setDate} />
        <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative flex-1 md:grow-0 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery && searchResults.length > 0) {
                    setSearchPopoverOpen(true);
                  }
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px] md:w-[400px] lg:w-[500px]">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Search Results</h4>
                {searchResults.map((transaction) => (
                  <Link href="/transactions" key={transaction.id} onClick={() => setSearchPopoverOpen(false)}>
                      <div className="flex items-center text-sm p-2 rounded-md hover:bg-muted">
                      <div>
                          <p className="font-medium">{transaction.name}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <div className={cn(
                          "ml-auto font-medium",
                          transaction.type === "income" ? "text-green-500" : "text-red-500"
                          )}>
                          {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </div>
                      </div>
                  </Link>
                ))}
              </div>
            ) : (
              searchQuery && !isSearching && (
                  <div className="p-4 text-center text-sm">
                  No results found for "{searchQuery}".
                  </div>
              )
            )}
          </PopoverContent>
        </Popover>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setRecapOpen(true)}>
              <History className="h-5 w-5" />
              <span className="sr-only">View recap</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View recap</p>
          </TooltipContent>
        </Tooltip>
        
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="h-5 w-5" />
                            {notifications.some(n => !n.read) && (
                              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                              </span>
                            )}
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Notifications</p>
                </TooltipContent>
            </Tooltip>
          <PopoverContent align="end" className="w-[380px]">
          <div className="p-4">
              <h3 className="text-lg font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">You have {notifications.filter(n => !n.read).length} unread messages.</p>
          </div>
          <Separator />
          <div className="p-2 space-y-2">
              {notifications.length > 0 ? notifications.map((notification, index) => {
                  const Icon = notification.icon;
                  return (
                      <div key={index} className={cn("flex items-start p-2 rounded-lg hover:bg-muted", !notification.read && "bg-primary/10")}>
                          <div className="p-2 bg-muted rounded-full">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="ml-4 flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.description}</p>
                          </div>
                      </div>
                  )
              }) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                  No new notifications
                </div>
              )}
          </div>
          <Separator />
          <div className="p-2">
              <Button size="sm" className="w-full" onClick={markAllAsRead} disabled={!notifications.some(n => !n.read)}>Mark all as read</Button>
          </div>
          </PopoverContent>
        </Popover>

        <Link href="/settings" className="cursor-pointer">
          <Avatar className="h-9 w-9 hidden sm:flex">
            <AvatarImage src="https://picsum.photos/100" alt="Avatar" data-ai-hint="person face" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
        </Link>
      </header>
      <main className="flex-1 p-6 bg-muted/40">
          {children}
      </main>
    </>
  )

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const renderMainContent = () => {
    if (!isClient) {
      return <>{MainContent}</>; // Render without TooltipProvider on server
    }
    return isMobile ? <>{MainContent}</> : <TooltipProvider>{MainContent}</TooltipProvider>;
  }

  return (
    <>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Logo className="size-8" />
              <h1 className="text-xl font-semibold">MoneyDesk</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                      <span>
                        <item.icon />
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/settings">
                  <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Settings">
                    <span>
                      <Settings />
                      Settings
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <Link href="/settings">
                    <div className="w-full p-2 cursor-pointer">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://picsum.photos/100" alt="Avatar" data-ai-hint="person face" />
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Smith</span>
                                <span className="text-xs text-muted-foreground">smith@example.com</span>
                            </div>
                        </div>
                    </div>
                  </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            {renderMainContent()}
        </SidebarInset>
      </SidebarProvider>
      <RecapStory open={recapOpen} onOpenChange={setRecapOpen} />
    </>
  );
};

export default AppLayout;
