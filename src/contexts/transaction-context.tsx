
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction } from '@/types';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
import { transactions as initialTransactions } from '@/lib/data';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = collection(db, 'users', user.uid, 'transactions');
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        // Check if transactions exist, if not, seed them.
        if (querySnapshot.empty) {
          console.log("No transactions found, seeding initial data...");
          for (const t of initialTransactions) {
            await addDoc(collection(db, 'users', user.uid, 'transactions'), {
              ...t
            });
          }
        } else {
            const userTransactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Transaction));
            setTransactions(userTransactions);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (user) {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), transaction);
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Omit<Transaction, 'id'>>) => {
    if (user) {
      const transactionRef = doc(db, 'users', user.uid, 'transactions', id);
      await updateDoc(transactionRef, updatedTransaction);
    }
  };
  
  const deleteTransaction = async (id: string) => {
    if (user) {
        const transactionRef = doc(db, 'users', user.uid, 'transactions', id);
        await deleteDoc(transactionRef);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
