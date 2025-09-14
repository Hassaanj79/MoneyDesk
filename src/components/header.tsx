
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  X,
  Loader2,
  History,
  Eye,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/icons/logo";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/budgets", label: "Budgets", icon: Target },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Header() {
  const pathname = usePathname();
  const { date, setDate } = useDateRange();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Omit<Transaction, 'categoryIcon'>[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = React.useState(false);
  const [recapOpen, setRecapOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { notifications, markAllAsRead } = useNotifications();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


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
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchPopoverOpen(false);
  };
  
  const HeaderContent = (
     <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo className="h-6 w-6" />
            <span className="">MoneyDesk</span>
          </Link>
           {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === item.href ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Logo className="h-6 w-6" />
                <span className="">MoneyDesk</span>
              </Link>
               {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "transition-colors hover:text-foreground",
                        pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    )}
                    >
                    {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-2">
            <div className="ml-auto flex-1 sm:flex-initial">
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>
            <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
            <PopoverTrigger asChild>
                <div className="relative flex-1 md:grow-0 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search transactions..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
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
            
            <TooltipProvider>
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
            </TooltipProvider>
            
            <Popover>
                <TooltipProvider>
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
                </TooltipProvider>
            <PopoverContent align="end" className="w-[380px]">
                <div className="p-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">You have {notifications.filter(n => !n.read).length} unread messages.</p>
                </div>
                <Separator />
                <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.slice(0, 5).map((notification) => {
                        const Icon = notification.icon;
                        return (
                            <Link href="/notifications" key={notification.id} className="block">
                            <div className={cn("flex items-start p-2 rounded-lg hover:bg-muted", !notification.read && "bg-primary/10")}>
                                <div className="p-2 bg-muted rounded-full">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                                </div>
                            </div>
                            </Link>
                        )
                    }) : (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        No new notifications
                    </div>
                    )}
                </div>
                <Separator />
                <div className="p-2 flex justify-between items-center">
                    <Button size="sm" variant="outline" onClick={markAllAsRead} disabled={!notifications.some(n => !n.read)}>Mark all as read</Button>
                    <Button size="sm" asChild>
                    <Link href="/notifications">
                        View All <Eye className="ml-2 h-4 w-4"/>
                    </Link>
                    </Button>
                </div>
            </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                     <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-9 w-9 cursor-pointer">
                            <AvatarImage src="https://picsum.photos/100" alt="Avatar" data-ai-hint="person face" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                     </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                    <div className="p-2">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Smith</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                smith@example.com
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="p-1">
                        <Link href="/settings">
                            <Button variant="ghost" className="w-full justify-start">
                                <Settings className="mr-2 h-4 w-4"/>
                                Settings
                            </Button>
                        </Link>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
        <RecapStory open={recapOpen} onOpenChange={setRecapOpen} />
    </header>
  );

  if (!isClient) {
    return <>{HeaderContent}</>;
  }
  
  if (isMobile) {
    return <>{HeaderContent}</>;
  }

  return <TooltipProvider>{HeaderContent}</TooltipProvider>;
}

    