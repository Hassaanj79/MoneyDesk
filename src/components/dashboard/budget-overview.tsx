
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { transactions as allTransactions } from '@/lib/data';
import { useDateRange } from '@/contexts/date-range-context';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Budget } from '@/types';

const initialBudgets: Omit<Budget, 'spent' | 'categoryName'>[] = [
  { categoryId: "1", limit: 500 },
  { categoryId: "7", limit: 400 },
  { categoryId: "2", limit: 800 },
  { categoryId: "4", limit: 200 },
];

const categories = [
    { id: "1", name: "Food", type: "expense" },
    { id: "2", name: "Shopping", type: "expense" },
    { id: "4", name: "Entertainment", type: "expense" },
    { id: '7', name: 'Groceries', type: 'expense' },
];

const BudgetOverview = () => {
    const { date } = useDateRange();

    const transactions = useMemo(() => {
        if (date?.from && date?.to) {
        return allTransactions.filter((t) =>
            isWithinInterval(parseISO(t.date), { start: date.from!, end: date.to! })
        );
        }
        return allTransactions;
    }, [date]);

    const budgets: Budget[] = useMemo(() => {
        return initialBudgets.map(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        const spent = transactions
            .filter(t => t.category === category?.name && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            ...budget,
            categoryName: category?.name || 'Unknown',
            spent: spent,
        };
        });
    }, [transactions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          return (
            <div key={budget.categoryId}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{budget.categoryName}</span>
                <span className="text-sm text-muted-foreground">
                  ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
