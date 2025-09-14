
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Check, ChevronsUpDown, User } from "lucide-react"
import { currencies, countries } from "@/lib/constants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { useCurrency } from "@/hooks/use-currency"

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  street: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),
  photo: z.any().optional(),
  currency: z.string().min(1, "Please select a currency."),
})

export function ProfileForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>("https://picsum.photos/100");
  const { addNotification } = useNotifications();
  const { currency, setCurrency } = useCurrency();
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "Smith",
      email: "smith@example.com",
      phone: "+1 234 567 890",
      street: "123 Main Street",
      state: "Anytown",
      zipcode: "12345",
      country: "US",
      currency: currency,
    },
  })

  useEffect(() => {
    form.setValue('currency', currency);
  }, [currency, form]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setCurrency(values.currency);
    addNotification({
      icon: User,
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
  }
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setPhotoPreview(URL.createObjectURL(file));
        form.setValue("photo", file);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-4">
               <Avatar className="h-20 w-20">
                <AvatarImage src={photoPreview || undefined} alt="Avatar" data-ai-hint="person face" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                </Button>
                <FormControl>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. 123 Main St" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
                <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. California" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Zip/Postal Code</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. 90210" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
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
                            (currency) => currency.code === field.value
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
                        {currencies.map((currency) => (
                          <CommandItem
                            value={currency.name}
                            key={currency.code}
                            onSelect={() => {
                              form.setValue("currency", currency.code)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currency.code === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {currency.name} ({currency.code})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the currency that will be used for all transactions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update Profile</Button>
      </form>
    </Form>
  )
}
