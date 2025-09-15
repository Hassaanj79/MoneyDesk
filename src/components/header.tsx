
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  LogOut,
  User as UserIcon,
  CalendarIcon,
} from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { DateRangePicker } from "@/components/date-range-picker";
import { useDateRange } from "@/contexts/date-range-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchTransactions } from "@/ai/flows/search";
import type { Transaction } from "@/types";
import { cn } from "@/lib/utils";
import { RecapStory } from "@/components/dashboard/recap-story";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/use-notifications";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTransactions } from "@/contexts/transaction-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/accounts", label: "Accounts", icon: Wallet },
    { href: "/budgets", label: "Budgets", icon: Target },
    { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Header() {
  const pathname = usePathname();
  const { date, setDate } = useDateRange();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Omit<Transaction, 'categoryIcon'>>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchPopoverOpen, setSearchPopoverOpen] = React.useState(false);
  const [recapOpen, setRecapOpen] = React.useState(false);
  const { notifications } = useNotifications();
  const [isClient, setIsClient] = React.useState(false);
  const { transactions } = useTransactions();
  const { user, logout } = useAuth();
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);


  React.useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
        const response = await searchTransactions({
          query: searchQuery,
          transactions: transactions,
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
  }, [searchQuery, transactions]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchPopoverOpen(false);
  };
  
  const HeaderContent = (
     <header className="sticky top-0 flex h-16 items-center gap-2 border-b bg-background px-4 md:px-6 z-40">
        <div className="flex items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
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
                    onClick={() => setMobileNavOpen(false)}
                >
                    <Logo className="h-6 w-6" />
                    <span className="">MoneyDesk</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                            "transition-colors hover:text-foreground flex items-center gap-4",
                            pathname === item.href ? "text-foreground" : "text-muted-foreground"
                        )}
                        >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
                </nav>
            </SheetContent>
            </Sheet>
            <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
            >
                <Logo className="h-6 w-6" />
                <span className="sr-only md:not-sr-only">MoneyDesk</span>
            </Link>
        </div>

        <nav className="hidden md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-4">
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
        

        <div className="flex w-full items-center gap-1 md:ml-auto md:gap-2 justify-end">
            <div className="hidden md:block">
                <DateRangePicker date={date} onDateChange={setDate} />
            </div>
             <div className="block md:hidden">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                         <DateRangePicker date={date} onDateChange={setDate} />
                    </PopoverContent>
                </Popover>
            </div>
            <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
            <PopoverTrigger asChild>
                <div className="relative flex-1 md:grow-0 max-w-sm">
                  <div className={cn('md:hidden', searchVisible ? 'hidden' : 'block')}>
                    <Button variant="ghost" size="icon" onClick={() => setSearchVisible(true)}>
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className={cn("relative", searchVisible || !isMobile ? 'block' : 'hidden')}>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                        if (searchQuery && searchResults.length > 0) {
                            setSearchPopoverOpen(true);
                        }
                        }}
                    />
                    {(searchQuery || searchVisible) && (
                        <Button
                        variant="ghost"
                        size="icon"
                        className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full", "md:hidden")}
                        onClick={() => {
                          clearSearch();
                          setSearchVisible(false)
                        }}
                        >
                        <X className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                </div>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[--radix-popover-trigger-width]">
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
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <Bell className="h-5 w-5" />
                      {notifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} data-ai-hint="person face" />
                    <AvatarFallback>{user?.displayName?.charAt(0) || <UserIcon />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

        </div>
        <RecapStory open={recapOpen} onOpenchange={setRecapOpen} />
    </header>
  );

  if (!isClient) {
    return <div className="h-16" />;
  }
  
  const content = <>{HeaderContent}</>

  if (isMobile) {
    return content;
  }

  return <TooltipProvider>{content}</TooltipProvider>;
}

    
