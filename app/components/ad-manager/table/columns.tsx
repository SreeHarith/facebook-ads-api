"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter here
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the type for our campaign data
export type Campaign = {
  id: string; // Firestore document ID
  facebookCampaignId: string;
  adName: string;
  goals: string;
  // These fields are now optional as they might not apply to every row
  type?: "image" | "video";
  platform?: "Facebook" | "Instagram" | "Both";
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: "Completed" | "In Progress" | "Paused";
};

// Helper to format currency
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// --- THIS IS THE FIX ---
// Create a new component specifically for the actions cell
const CampaignActionsCell = ({ row }: { row: Row<Campaign> }) => {
  const router = useRouter(); // Use the hook safely inside a React component
  const campaign = row.original;

  const handleAddNewAdSet = () => {
    router.push(`/?campaignId=${campaign.facebookCampaignId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {/* Use the onClick handler for programmatic navigation */}
        <DropdownMenuItem onClick={handleAddNewAdSet}>
          Add New Ad Set
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/campaigns/${campaign.facebookCampaignId}`}>
            View Statistics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "adName",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("adName")}</div>
    ),
  },
  {
    id: 'bid_strategy',
    header: "Bid Strategy",
    cell: () => "Using ad set bid strategy",
  },
  {
    accessorKey: "budget",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Budget
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.budget)}</div>,
  },
  {
    id: 'attribution_setting',
    header: 'Attribution Setting',
    cell: () => '7-day click or 1-day view',
  },
  {
    accessorKey: "goals",
    header: "Results",
    cell: ({ row }) => {
      const goal = row.original.goals;
      const resultText = goal.includes('TRAFFIC') ? 'Link clicks' : goal.toLowerCase();
      return <div className="capitalize">{resultText}</div>
    }
  },
  {
    accessorKey: "endDate",
    header: "Ends",
    cell: ({ row }) => {
      return row.original.endDate === "N/A" ? "Ongoing" : row.original.endDate;
    },
  },
  {
    id: "actions",
    // Use the new component for rendering the cell
    cell: ({ row }) => <CampaignActionsCell row={row} />,
  },
];

