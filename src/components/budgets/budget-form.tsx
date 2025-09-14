
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
import type { Budget, Category } from "@/types";
import { useEffect, useState } from "react";
import { CategoryCombobox } from "../categories/category-combobox";

const formSchema = z.object({
  categoryId: z.string().min(1, "Please select a category."),
  limit: z.coerce.number().positive("Budget limit must be a positive number."),
});

type BudgetFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  existingBudget?: Budget | null;
  allBudgets: Budget[];
  categories: Category[];
  onCategoryCreated: (name: string) => Category;
};

export function BudgetForm({ onSubmit, existingBudget, allBudgets, categories, onCategoryCreated }: BudgetFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: existingBudget?.categoryId || "",
      limit: existingBudget?.limit || 0,
    },
  });
  
  useEffect(() => {
    form.reset({
        categoryId: existingBudget?.categoryId || "",
        limit: existingBudget?.limit || 0,
    })
  }, [existingBudget, form])

  const handleCategoryCreated = (name: string) => {
    const newCategory = onCategoryCreated(name);
    form.setValue('categoryId', newCategory.id);
  }

  const availableCategories = categories.filter(c => 
    !allBudgets.some(b => b.categoryId === c.id) || (existingBudget && c.id === existingBudget.categoryId)
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategoryCombobox 
                    categories={availableCategories}
                    value={field.value}
                    onChange={field.onChange}
                    onCategoryCreated={handleCategoryCreated}
                    disabled={!!existingBudget}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Limit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 500.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {existingBudget ? "Save Changes" : "Create Budget"}
        </Button>
      </form>
    </Form>
  );
}
