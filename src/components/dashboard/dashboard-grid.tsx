
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSwappingStrategy,
} from "@dnd-kit/sortable";

import BalanceCard from "@/components/dashboard/balance-card";
import BudgetOverview from "@/components/dashboard/budget-overview";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { useDateRange } from "@/contexts/date-range-context";
import { SortableItem } from "./sortable-item";
import { useTransactions } from "@/contexts/transaction-context";
import { isWithinInterval, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";

const gridComponents = [
    {
      id: "balance",
      component: BalanceCard,
      colSpan: "md:col-span-1",
      props: { title: "Total Balance", icon: Wallet }
    },
    {
      id: "income",
      component: BalanceCard,
      colSpan: "md:col-span-1",
       props: { title: "Income", icon: ArrowDown, className: "text-green-500", iconClassName: "text-green-500" }
    },
    {
      id: "expense",
      component: BalanceCard,
      colSpan: "md:col-span-1",
      props: { title: "Expense", icon: ArrowUp, className: "text-red-500", iconClassName: "text-red-500" }
    },
    {
      id: "chart",
      component: IncomeExpenseChart,
      colSpan: "md:col-span-3",
      props: {}
    },
    {
      id: "budget",
      component: BudgetOverview,
      colSpan: "md:col-span-2",
      props: {}
    },
    {
      id: "recent",
      component: RecentTransactions,
      colSpan: "md:col-span-1",
      props: {}
    },
  ];


export default function DashboardGrid() {
  const { date } = useDateRange();
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [items, setItems] = useState(gridComponents.map(item => item.id));

  const { totalBalance, totalIncome, totalExpense, incomeChange, expenseChange } = useMemo(() => {
    const currentPeriodTransactions = transactions.filter(t => 
      date?.from && date?.to ? isWithinInterval(parseISO(t.date), { start: date.from, end: date.to }) : true
    );

    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
    const lastMonthTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd })
    );

    const currentIncome = currentPeriodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpense = currentPeriodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const lastMonthExpense = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }

    const incomeChange = calculatePercentageChange(currentIncome, lastMonthIncome);
    const expenseChange = calculatePercentageChange(currentExpense, lastMonthExpense);

    const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

    return {
      totalBalance,
      totalIncome: currentIncome,
      totalExpense: currentExpense,
      incomeChange,
      expenseChange
    };
  }, [transactions, date]);


  const componentProps: Record<string, any> = {
      balance: { amount: formatCurrency(totalBalance) },
      income: { amount: formatCurrency(totalIncome), change: incomeChange },
      expense: { amount: formatCurrency(totalExpense), change: expenseChange },
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.indexOf(active.id as string);
        const newIndex = currentItems.indexOf(over.id as string);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };
  
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setItems(gridComponents.map(item => item.id));
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DndContext
      id="dashboard-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSwappingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((id) => {
             const item = gridComponents.find(i => i.id === id);
             if (!item) return null;
             const Component = item.component;
             const props = {...item.props, ...componentProps[id]};
             return (
                 <SortableItem key={id} id={id} className={item.colSpan}>
                    <Component {...props} />
                </SortableItem>
             )
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
