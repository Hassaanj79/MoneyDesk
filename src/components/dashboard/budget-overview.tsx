

"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDateRange } from '@/contexts/date-range-context';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Budget, Category } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { useTransactions } from '@/contexts/transaction-context';

const initialBudgets: Omit<Budget, 'spent' | 'categoryName' | 'id'>[] = [
  { categoryId: "1", limit: 500 },
  { categoryId: "7", limit: 400 },
  { categoryId: "2", limit: 800 },
  { categoryId: "4", limit: 200 },
];

const initialCategories: Category[] = [
    { id: "1", name: "Food", type: "expense" },
    { id: "2", name: "Shopping", type: "expense" },
    { id: "3", name: "Transport", type: "expense" },
    { id: "4", name: "Entertainment", type: "expense" },
    { id: "5", name: "Salary", type: "income" },
    { id: "6", name: "Freelance", type: "income" },
    { id: '7', name: 'Groceries', type: 'expense' },
];

const BudgetOverview = () => {
    const { date } = useDateRange();
    const { formatCurrency } = useCurrency();
    const { transactions } = useTransactions();
    const [budgets] = useState<Omit<Budget, 'id'>[]>(initialBudgets);
    const [categories] = useState<Category[]>(initialCategories);


    const processedBudgets = useMemo(() => {
        return budgets.map((budget, index) => {
            const id = (index + 1).toString();
            const category = categories.find(c => c.id === budget.categoryId);
            const spent = transactions
                .filter(t => t.category === category?.name && t.type === 'expense' && date?.from && date?.to && isWithinInterval(parseISO(t.date), {start: date.from, end: date.to}))
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                ...budget,
                id,
                categoryName: category?.name || 'Unknown',
                spent: spent,
            };
        }).slice(0, 4); // Show only top 4 for overview
    }, [budgets, categories, transactions, date]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedBudgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          return (
            <div key={budget.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{budget.categoryName}</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
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
