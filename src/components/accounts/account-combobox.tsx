
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Account } from "@/types"

type AccountComboboxProps = {
    accounts: Account[];
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyPlaceholder?: string;
}

export function AccountCombobox({ 
    accounts, 
    disabled,
    value,
    onChange,
    placeholder = "Select account...",
    searchPlaceholder = "Search accounts...",
    emptyPlaceholder = "No account found.",
}: AccountComboboxProps) {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
        <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        disabled={disabled}
        >
        {value
            ? accounts.find((account) => account.id === value)?.name
            : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
        <CommandInput 
            placeholder={searchPlaceholder} 
        />
        <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
            {accounts.map((account) => (
                <CommandItem
                key={account.id}
                value={account.id}
                onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                }}
                >
                <Check
                    className={cn(
                    "mr-2 h-4 w-4",
                    value === account.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {account.name}
                </CommandItem>
            ))}
            </CommandGroup>
        </CommandList>
        </Command>
    </PopoverContent>
    </Popover>
  )
}

    