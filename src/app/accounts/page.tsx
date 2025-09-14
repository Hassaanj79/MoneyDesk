
"use client";

import { useState, useMemo } from "react";
import { AddAccountForm } from "@/components/accounts/add-account-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Account } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { useTransactions } from "@/contexts/transaction-context";

const initialAccounts: Omit<Account, 'balance'>[] = [
  { id: '1', name: 'Chase Checking', type: 'bank', initialBalance: 12500.50 },
  { id: '2', name: 'Venture Rewards', type: 'credit-card', initialBalance: -2500.00 },
  { id: '3', name: 'PayPal', type: 'paypal', initialBalance: 850.25 },
  { id: '4', name: 'Cash', type: 'cash', initialBalance: 300.00 },
];

function getAccountTypeLabel(type: Account['type']) {
    switch (type) {
        case 'bank': return 'Bank Account';
        case 'credit-card': return 'Credit Card';
        case 'debit-card': return 'Debit Card';
        case 'paypal': return 'PayPal';
        case 'zelle': return 'Zelle';
        case 'cash-app': return 'Cash App';
        case 'cash': return 'Cash';
        case 'custom': return 'Custom';
    }
}


export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Omit<Account, 'balance'>[]>(initialAccounts);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { transactions } = useTransactions();

  const processedAccounts: Account[] = useMemo(() => {
    return accounts.map(account => {
      const balance = transactions.reduce((acc, t) => {
        if (t.accountId === account.id) {
          return acc + (t.type === 'income' ? t.amount : -t.amount);
        }
        return acc;
      }, account.initialBalance);
      return { ...account, balance };
    })
  }, [accounts, transactions]);

  const handleAddAccount = (newAccountData: Omit<Account, 'id' | 'balance'>) => {
    const newAccount = { ...newAccountData, id: (accounts.length + 1).toString() };
    setAccounts(prev => [...prev, newAccount]);
    setAddDialogOpen(false);
  }

  const handleDeleteClick = (account: Account) => {
    setSelectedAccount(account);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedAccount) {
      setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
    }
    setDeleteDialogOpen(false);
    setSelectedAccount(null);
  }

  return (
    <>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                Manage your financial accounts.
              </CardDescription>
            </div>
            <DialogTrigger asChild>
              <Button className="ml-auto gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
                    <TableCell className="text-right">
                      ${account.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                     <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(account);
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Account</DialogTitle>
          </DialogHeader>
          <AddAccountForm onAccountAdded={handleAddAccount}/>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
