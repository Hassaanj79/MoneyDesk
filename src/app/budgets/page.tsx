
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit, Trash2, DollarSign } from "lucide-react";
import type { Category, Budget } from "@/types";
import { BudgetForm } from "@/components/budgets/budget-form";
import { transactions as allTransactions } from "@/lib/data";
import { useDateRange } from "@/contexts/date-range-context";
import { isWithinInterval, parseISO } from "date-fns";

const initialBudgets: Omit<Budget, 'spent' | 'categoryName'>[] = [
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
    { id: '8', name: 'Utilities', type: 'expense' },
    { id: '9', name: 'Housing', type: 'expense' },
    { id: '10', name: 'Health', type: 'expense' },
    { id: '11', name: 'Investment', type: 'income' },
    { id: '12', name: 'Gifts', type: 'expense' },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { date } = useDateRange();

  const transactions = useMemo(() => {
    if (date?.from && date?.to) {
      return allTransactions.filter((t) =>
        isWithinInterval(parseISO(t.date), { start: date.from!, end: date.to! })
      );
    }
    return allTransactions;
  }, [date]);

  const processedBudgets: Budget[] = useMemo(() => {
    return budgets.map(budget => {
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
  }, [budgets, categories, transactions]);


  const handleAddBudget = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleDeleteBudget = (categoryId: string) => {
    setBudgets(budgets.filter(b => b.categoryId !== categoryId));
  };

  const handleSaveBudget = (data: { categoryId: string; limit: number }) => {
    if (editingBudget) {
      setBudgets(budgets.map(b => b.categoryId === editingBudget.categoryId ? { ...b, limit: data.limit } : b));
    } else {
      if (!budgets.some(b => b.categoryId === data.categoryId)) {
        setBudgets([...budgets, data]);
      }
    }
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleCategoryCreated = (name: string) => {
      const newCategory: Category = {
          id: (categories.length + 1).toString(),
          name,
          type: 'expense'
      };
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) {
            setEditingBudget(null);
        }
    }}>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              Create and manage your spending budgets.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button className="ml-auto gap-1" onClick={handleAddBudget}>
              <PlusCircle className="h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {processedBudgets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processedBudgets.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                return (
                  <Card key={budget.categoryId} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {budget.categoryName}
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.categoryId)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Spent</span>
                          <span>Budget</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-bold">${budget.spent.toFixed(2)}</span>
                          <span className="text-lg font-medium text-muted-foreground">/ ${budget.limit.toFixed(2)}</span>
                        </div>
                        <Progress value={percentage} />
                        <div className="text-sm text-muted-foreground">
                          {percentage > 100 
                            ? <p className="text-destructive font-medium">You've overspent by ${ (budget.spent - budget.limit).toFixed(2) }</p>
                            : <p>${ (budget.limit - budget.spent).toFixed(2) } remaining</p>
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <DollarSign className="w-12 h-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No budgets created yet.</p>
              <Button className="mt-4" onClick={handleAddBudget}>Create Your First Budget</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Edit" : "Add"} Budget</DialogTitle>
        </DialogHeader>
        <BudgetForm
          onSubmit={handleSaveBudget}
          existingBudget={editingBudget}
          allBudgets={processedBudgets}
          categories={categories.filter(c => c.type === 'expense')}
          onCategoryCreated={handleCategoryCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
