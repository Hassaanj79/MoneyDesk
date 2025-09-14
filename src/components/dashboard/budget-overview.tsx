
"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDateRange } from '@/contexts/date-range-context';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Budget, Category } from '@/types';
import { useCurrency } from '@/hooks/use-currency';
import { useTransactions } from '@/contexts/transaction-context';
import { useAuth } from '@/contexts/auth-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BudgetOverview = () => {
    const { date } = useDateRange();
    const { formatCurrency } = useCurrency();
    const { transactions } = useTransactions();
    const { user } = useAuth();
    const [budgets, setBudgets] = useState<(Budget & { id: string })[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);


     useEffect(() => {
        if (user) {
            const budgetsUnsub = onSnapshot(collection(db, 'users', user.uid, 'budgets'), (snapshot) => {
                setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget & { id: string })));
            });
            const categoriesUnsub = onSnapshot(collection(db, 'users', user.uid, 'categories'), (snapshot) => {
                setCategories(snapshot.docs.map(doc => doc.data() as Category));
            });
            return () => {
                budgetsUnsub();
                categoriesUnsub();
            }
        }
     }, [user]);

    const processedBudgets = useMemo(() => {
        return budgets.map(budget => {
        const category = categories.find(c => c.id === budget.categoryId);
        const spent = transactions
            .filter(t => t.category === category?.name && t.type === 'expense' && date?.from && date?.to && isWithinInterval(parseISO(t.date), {start: date.from, end: date.to}))
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            ...budget,
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
