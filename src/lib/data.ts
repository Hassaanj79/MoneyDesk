
import type { Transaction } from "@/types";

export const transactions: Omit<Transaction, 'categoryIcon'>[] = [
    { id: "1", name: "Starbucks", category: "Food", date: "2024-07-29", amount: 7.50, type: "expense", accountId: "1" },
    { id: "2", name: "Salary", category: "Salary", date: "2024-07-28", amount: 2500, type: "income", accountId: "1" },
    { id: "3", name: "Zara", category: "Shopping", date: "2024-07-27", amount: 125, type: "expense", accountId: "2" },
    { id: "4", name: "Uber", category: "Transport", date: "2024-07-26", amount: 22.45, type: "expense", accountId: "1" },
    { id: "5", name: "Netflix", category: "Entertainment", date: "2024-07-25", amount: 15.99, type: "expense", accountId: "2" },
    { id: "6", name: "Freelance Project", category: "Freelance", date: "2024-07-24", amount: 750, type: "income", accountId: '1' },
    { id: "7", name: "Groceries from Whole Foods", category: "Groceries", date: "2024-07-23", amount: 85.60, type: "expense", accountId: '1' },
    { id: "8", name: "Movie Tickets for 'Dune'", category: "Entertainment", date: "2024-07-22", amount: 32.00, type: "expense", accountId: '2' },
    { id: "9", name: "Monthly Rent", category: "Housing", date: "2024-07-01", amount: 1200, type: "expense", accountId: "1" },
    { id: "10", name: "Electricity Bill", category: "Utilities", date: "2024-07-15", amount: 75.50, type: "expense", accountId: "1" },
    { id: "11", name: "Gym Membership", category: "Health", date: "2024-07-05", amount: 50, type: "expense", accountId: "2" },
    { id: "12", name: "Dinner at Italian Restaurant", category: "Food", date: "2024-07-18", amount: 65, type: "expense", accountId: "2" },
    { id: "13", name: "Amazon Purchase", category: "Shopping", date: "2024-07-20", amount: 45.99, type: "expense", accountId: "3" },
    { id: "14", name: "Stock Dividend", category: "Investment", date: "2024-07-10", amount: 120, type: "income", accountId: "1" },
    { id: "15", name: "Gasoline", category: "Transport", date: "2024-07-12", amount: 40.25, type: "expense", accountId: "1" },
    { id: "16", name: "Concert Tickets", category: "Entertainment", date: "2024-06-30", amount: 150, type: "expense", accountId: "2" },
    { id: "17", name: "Consulting Gig", category: "Freelance", date: "2024-06-25", amount: 500, type: "income", accountId: "3" },
    { id: "18", name: "New Shoes from Nike", category: "Shopping", date: "2024-06-22", amount: 180, type: "expense", accountId: "2" },
    { id: "19", name: "Water Bill", category: "Utilities", date: "2024-06-18", amount: 45, type: "expense", accountId: "1" },
    { id: "20", name: "Birthday Gift", category: "Gifts", date: "2024-06-15", amount: 100, type: "expense", accountId: "3" },
];
