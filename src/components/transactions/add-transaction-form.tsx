
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import type { Category } from "@/types";
import { useTransactions } from "@/contexts/transaction-context";
import { useNotifications } from "@/hooks/use-notifications";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect } from "react";
import { useAccounts } from "@/contexts/account-context";
import { useCategories } from "@/contexts/category-context";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  name: z.string().min(2, "Description is too short."),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date(),
  accountId: z.string().min(1, "Please select an account."),
  categoryId: z.string().min(1, "Please select a category."),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.string().optional(),
  receipt: z.any().optional(),
});

type AddTransactionFormProps = {
  type: "income" | "expense";
  onSuccess?: () => void;
};

export function AddTransactionForm({ type, onSuccess }: AddTransactionFormProps) {
  const { addTransaction } = useTransactions();
  const { addNotification } = useNotifications();
  const { formatCurrency } = useCurrency();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: type,
      amount: undefined,
      date: new Date(),
      accountId: "",
      categoryId: "",
      name: "",
      isRecurring: false,
    },
  });

  useEffect(() => {
    form.reset({
      type: type,
      amount: undefined,
      date: new Date(),
      accountId: "",
      categoryId: "",
      name: "",
      isRecurring: false,
    });
  }, [type, form]);
  

  const isRecurring = form.watch("isRecurring");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { receipt, ...transactionData } = values;

    await addTransaction({
      ...transactionData,
      date: format(values.date, "yyyy-MM-dd"),
    });

    addNotification({
      icon: values.type === 'income' ? ArrowUp : ArrowDown,
      title: `Transaction Added`,
      description: `${values.name} for ${formatCurrency(values.amount)} has been saved.`,
    });

    onSuccess?.();
    form.reset();
  }

  const filteredCategories = categories.filter((c) => c.type === type);

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
                <Input type="number" placeholder="0.00" {...field} step="0.01"/>
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
                <div>
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
                </div>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Account</FormLabel>
                <div>
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
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
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
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center space-x-2">
            <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                <div className="space-y-0.5">
                    <FormLabel>Recurring Transaction</FormLabel>
                </div>
                <FormControl>
                    <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                </FormControl>
                </FormItem>
            )}
            />
            {isRecurring && (
                 <FormField
                 control={form.control}
                 name="recurrenceFrequency"
                 render={({ field }) => (
                   <FormItem className="flex-1">
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Frequency" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="daily">Daily</SelectItem>
                         <SelectItem value="weekly">Weekly</SelectItem>
                         <SelectItem value="monthly">Monthly</SelectItem>
                         <SelectItem value="yearly">Yearly</SelectItem>
                       </SelectContent>
                     </Select>
                   </FormItem>
                 )}
               />
            )}
        </div>
        
        {type === 'expense' && (
             <FormField
             control={form.control}
             name="receipt"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Receipt</FormLabel>
                 <FormControl>
                   <Button variant="outline" asChild className="w-full cursor-pointer">
                     <div>
                       <Upload className="mr-2 h-4 w-4" />
                       Upload or Capture Image
                       <Input type="file" accept="image/*" className="sr-only" onChange={(e) => field.onChange(e.target.files)} />
                     </div>
                   </Button>
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
        )}


        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
