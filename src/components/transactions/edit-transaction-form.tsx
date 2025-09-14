

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Account, Category, Transaction } from "@/types";
import { useTransactions } from "@/contexts/transaction-context";
import { useState } from "react";


const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  name: z.string().min(2, "Description is too short."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date(),
  accountId: z.string().min(1, "Please select an account."),
  category: z.string().min(1, "Please select a category."),
});

type EditTransactionFormProps = {
  transaction: Transaction;
  onSuccess?: () => void;
};

const accountsData: Account[] = [
    { id: "1", name: 'Chase Checking', type: 'bank', initialBalance: 12500.50, balance: 0 },
    { id: "2", name: 'Venture Rewards', type: 'credit-card', initialBalance: -2500.00, balance: 0 },
    { id: "3", name: 'PayPal', type: 'paypal', initialBalance: 850.25, balance: 0 },
    { id: "4", name: 'Cash', type: 'cash', initialBalance: 300.00, balance: 0 },
];
const categoriesData: Category[] = [
    { id: "1", name: "Food", type: "expense" },
    { id: "2", name: "Shopping", type: "expense" },
    { id: "3", name: "Transport", type: "expense" },
    { id: "4", name: "Entertainment", type: "expense" },
    { id: "5", name: "Salary", type: "income" },
    { id: "6", name: "Freelance", type: "income" },
    { id: '7', name: 'Groceries', type: 'expense' },
];

export function EditTransactionForm({ transaction, onSuccess }: EditTransactionFormProps) {
  const { updateTransaction } = useTransactions();
  const [accounts] = useState<Account[]>(accountsData);
  const [categories] = useState<Category[]>(categoriesData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...transaction,
      date: parseISO(transaction.date),
      amount: Math.abs(transaction.amount),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await updateTransaction(transaction.id, {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    });
    onSuccess?.();
  }

  const filteredCategories = categories.filter((c) => c.type === transaction.type);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Account</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
