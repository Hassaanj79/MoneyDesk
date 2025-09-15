
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type BalanceCardProps = {
  title: string;
  amount: string;
  icon: LucideIcon;
  change?: string;
  changeDescription?: string;
  className?: string;
  iconClassName?: string;
};

const BalanceCard = ({ title, amount, icon: Icon, change, changeDescription, className, iconClassName }: BalanceCardProps) => {
  const isPositive = change?.startsWith("+");
  const isNegative = change?.startsWith("-");
  const isDateRange = title === 'Date Range';

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconClassName)} aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex-1">
        <div className={cn("font-semibold tracking-tight text-3xl", className)}>{amount}</div>
        {change ? (
          <p className={cn(
            "text-xs font-medium",
            isPositive && "text-red-700 dark:text-red-400",
            isNegative && "text-green-700 dark:text-green-400",
            !isPositive && !isNegative && "text-muted-foreground",
            isDateRange ? "whitespace-nowrap" : ""
          )}>
            {change} {changeDescription || 'from last month'}
          </p>
        ) : (
          <p className="text-xs font-medium invisible">No change</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
