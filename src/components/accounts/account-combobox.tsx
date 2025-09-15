
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Account } from "@/types"
import { AddAccountForm } from "./add-account-form"

type AccountComboboxProps = {
    accounts: Account[];
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
    onAccountCreated: (account: Omit<Account, 'id' | 'userId' | 'balance'>) => Promise<Account>;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyPlaceholder?: string;
}

export function AccountCombobox({ 
    accounts, 
    disabled,
    value,
    onChange,
    onAccountCreated,
    placeholder = "Select account...",
    searchPlaceholder = "Search accounts...",
    emptyPlaceholder = "No account found.",
}: AccountComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [addAccountDialogOpen, setAddAccountDialogOpen] = React.useState(false);

  const handleCreateSuccess = async (newAccountName: string, newAccount: Omit<Account, 'id' | 'userId' | 'balance'>) => {
    const createdAccount = await onAccountCreated(newAccount);
    onChange(createdAccount.id);
    setAddAccountDialogOpen(false);
    setOpen(false);
  };

  return (
    <Dialog open={addAccountDialogOpen} onOpenChange={setAddAccountDialogOpen}>
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
                <DialogTrigger asChild>
                    <CommandItem onSelect={() => {
                        setAddAccountDialogOpen(true);
                    }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create new account
                    </CommandItem>
                </DialogTrigger>
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Account</DialogTitle>
            </DialogHeader>
            <AddAccountForm onSuccess={(name, values) => handleCreateSuccess(name, values)} />
        </DialogContent>
    </Dialog>
  )
}
