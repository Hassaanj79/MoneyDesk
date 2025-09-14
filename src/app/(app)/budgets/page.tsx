

"use client";

import { useState, useMemo, useEffect } from "react";
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
import { useDateRange } from "@/contexts/date-range-context";
import { isWithinInterval, parseISO } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { useTransactions } from "@/contexts/transaction-context";
import { useAuth } from "@/contexts/auth-context";
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


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
    { id: '8', name: 'Utilities', type: 'expense' },
    { id: '9', name: 'Housing', type: 'expense' },
    { id: '10', name: 'Health', type: 'expense' },
    { id: '11', name: 'Investment', type: 'income' },
    { id: '12', name: 'Gifts', type: 'expense' },
];

type BudgetWithId = Budget & { id: string };

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithId[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithId | null>(null);
  const { date } = useDateRange();
  const { formatCurrency } = useCurrency();
  const { transactions } = useTransactions();
  const { user } = useAuth();
  

  useEffect(() => {
    if (user) {
        const budgetsUnsub = onSnapshot(collection(db, 'users', user.uid, 'budgets'), async (snapshot) => {
            if(snapshot.empty) {
                for (const b of initialBudgets) {
                    await addDoc(collection(db, 'users', user.uid, 'budgets'), b);
                }
            } else {
                setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetWithId)));
            }
        });
        
        const categoriesUnsub = onSnapshot(collection(db, 'users', user.uid, 'categories'), async (snapshot) => {
            if (snapshot.empty) {
                for (const cat of initialCategories) {
                     await setDoc(doc(db, 'users', user.uid, 'categories', cat.id), cat);
                }
            } else {
                 setCategories(snapshot.docs.map(doc => doc.data() as Category));
            }
        });


        return () => {
            budgetsUnsub();
            categoriesUnsub();
        }
    }
  }, [user]);

  const processedBudgets: (BudgetWithId & { spent: number, categoryName: string})[] = useMemo(() => {
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
    });
  }, [budgets, categories, transactions, date]);


  const handleAddBudget = () => {
    setEditingBudget(null);
    setDialogOpen(true);
  };

  const handleEditBudget = (budget: BudgetWithId) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'budgets', id));
    }
  };

  const handleSaveBudget = async (data: { categoryId: string; limit: number }) => {
    if (user) {
        if (editingBudget) {
            await updateDoc(doc(db, 'users', user.uid, 'budgets', editingBudget.id), { limit: data.limit });
        } else {
             if (!budgets.some(b => b.categoryId === data.categoryId)) {
                await addDoc(collection(db, 'users', user.uid, 'budgets'), data);
            }
        }
    }
    setDialogOpen(false);
    setEditingBudget(null);
  };

  const handleCategoryCreated = async (name: string) => {
      const newCategory: Omit<Category, 'id'> = {
          name,
          type: 'expense'
      };
      if (user) {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'categories'), newCategory);
        return { ...newCategory, id: docRef.id };
      }
      // Fallback for when user is not available, though it shouldn't happen
      const tempCategory = { ...newCategory, id: (categories.length + 1).toString() };
      setCategories(prev => [...prev, tempCategory]);
      return tempCategory;
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
                  <Card key={budget.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {budget.categoryName}
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEditBudget(budget)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
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
                          <span className="text-2xl font-bold">{formatCurrency(budget.spent)}</span>
                          <span className="text-lg font-medium text-muted-foreground">/ {formatCurrency(budget.limit)}</span>
                        </div>
                        <Progress value={percentage} />
                        <div className="text-sm text-muted-foreground">
                          {percentage > 100 
                            ? <p className="text-destructive font-medium">You've overspent by {formatCurrency(budget.spent - budget.limit)}</p>
                            : <p>{formatCurrency(budget.limit - budget.spent)} remaining</p>
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
