
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { currencies, countries, timezones } from "@/lib/constants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useCurrency } from "@/hooks/use-currency"
import { useAuth } from "@/contexts/auth-context"
import { updateUserProfile } from "@/services/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { useRouter } from "next/navigation"

const welcomeFormSchema = z.object({
  phone: z.string().optional(),
  street: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().min(1, "Please select a country."),
  currency: z.string().min(1, "Please select a currency."),
  timezone: z.string().min(1, "Please select a timezone."),
})

export function WelcomeForm() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm<z.infer<typeof welcomeFormSchema>>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues: {
      phone: "",
      street: "",
      state: "",
      zipcode: "",
      country: "",
      currency: currency,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    form.setValue('currency', currency);
  }, [currency, form]);

  async function onSubmit(values: z.infer<typeof welcomeFormSchema>) {
    if (!user) return;
    setLoading(true);

    try {
        await updateUserProfile(user.uid, {
            ...values,
            onboardingCompleted: true
        });

        if (values.currency) {
            setCurrency(values.currency);
        }
        router.push('/');

    } catch (error) {
        console.error("Failed to update profile", error);
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
        <CardHeader>
            <CardTitle>Welcome to MoneyDesk!</CardTitle>
            <CardDescription>
                Let's get your account set up. Please fill in the details below.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="Your phone number" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 123 Main St" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City / State</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. San Francisco" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="zipcode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Zip/Postal Code</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 90210" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem className="flex flex-col pt-2">
                            <FormLabel>Country</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value
                                        ? countries.find(
                                            (country) => country.code === field.value
                                        )?.name
                                        : "Select country"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                        <CommandItem
                                            value={country.name}
                                            key={country.code}
                                            onSelect={() => {
                                            form.setValue("country", country.code)
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                country.code === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {country.name}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Currency</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value
                                    ? currencies.find(
                                        (c) => c.code === field.value
                                    )?.name
                                    : "Select currency"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search currency..." />
                                <CommandList>
                                <CommandEmpty>No currency found.</CommandEmpty>
                                <CommandGroup>
                                    {currencies.map((c) => (
                                    <CommandItem
                                        value={c.name}
                                        key={c.code}
                                        onSelect={() => {
                                        form.setValue("currency", c.code)
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            c.code === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                        />
                                        {c.name} ({c.code})
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                        <FormDescription>
                            This will be your default currency.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Timezone</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value || "Select timezone"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search timezone..." />
                                    <CommandList>
                                    <CommandEmpty>No timezone found.</CommandEmpty>
                                    <CommandGroup>
                                        {timezones.map((tz) => (
                                        <CommandItem
                                            value={tz}
                                            key={tz}
                                            onSelect={() => {
                                                form.setValue("timezone", tz)
                                            }}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                tz === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {tz}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                This helps sync your transaction dates.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue to Dashboard
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  )
}
