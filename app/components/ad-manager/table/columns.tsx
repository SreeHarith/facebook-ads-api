"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

export type Campaign = {
  id: string;
  adName: string;
  goals: string;
  type: "image" | "video";
  platform: "Facebook" | "Instagram" | "Both";
  startDate: string;
  endDate: string;
  budget: number;
  status: "Completed" | "In Progress" | "Paused";
};

export const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "adName",
    header: "Ad Name",
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue("adName")}</div>
    ),
  },
  {
    accessorKey: "goals",
    header: "Goals",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return <div className="capitalize">{type}</div>;
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "budget",
    header: () => <div className="text-right">Budget</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("budget"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = {
        "Completed": "default",
        "In Progress": "secondary",
        "Paused": "outline",
      }[status] as "default" | "secondary" | "outline";
      
      return <Badge variant={variant} className="capitalize">{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];