"use client";
import React from "react";
import { useInquiries } from "../../src/hooks/useInquiries";
import { useFaqs } from "../../src/hooks/useFaqs";
import { Inquiry, FAQ } from "../../src/types/supabase";
import { Button } from "../../src/components/ui/button";
import { Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "../../src/components/ui/table";
import { Input } from "../../src/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../src/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent } from "../../src/components/ui/dialog";
import { Textarea } from "../../src/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../../src/components/ui/select";
import { Card } from "../../src/components/ui/card";
import { Badge } from "../../src/components/ui/badge";
import { Skeleton } from "../../src/components/ui/skeleton";
import { Toast } from "../../src/components/ui/toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../src/components/ui/tooltip";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "../../src/components/ui/alert-dialog";
import { DashboardLayout } from "../../src/components/ui/dashboard-layout";

const RESPONSE_TEMPLATES = [
  "Yes, we can accommodate that!",
  "Please clarify your request.",
  "Thank you for your inquiry. We'll get back to you soon.",
  "This is a common question. Please see our FAQ section.",
  "We appreciate your feedback!"
];

export default function CustomerInquiriesPage() {
  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Customer Inquiries</h1>
            <p className="text-muted-foreground">
              View and respond to customer queries escalated from the checkout chatbot, and manage FAQs to reduce escalations.
            </p>
          </div>
          {/* Analytics Section */}
          <Card className="mb-6 p-4 flex flex-col md:flex-row gap-4">
            <div>
              <div className="text-lg font-semibold">23</div>
              <div className="text-xs text-muted-foreground">Queries this week</div>
            </div>
            <div>
              <Badge variant="secondary">80% answered by FAQs</Badge>
            </div>
            <div>
              <div className="text-lg font-semibold">2h 15m</div>
              <div className="text-xs text-muted-foreground">Avg. response time</div>
            </div>
            <div>
              <div className="text-lg font-semibold">12%</div>
              <div className="text-xs text-muted-foreground">Conversion rate</div>
            </div>
          </Card>
          {/* Inquiries Table */}
          <Card className="mb-8 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <Input placeholder="Search by email or summary..." className="w-full md:w-1/3" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Pending</DropdownMenuItem>
                  <DropdownMenuItem>Responded</DropdownMenuItem>
                  <DropdownMenuItem>Resolved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">Refresh</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Email</TableHead>
                  <TableHead>Query Summary</TableHead>
                  <TableHead>Cart Value</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Map inquiries here */}
                <TableRow>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Asked about custom engraving...</TableCell>
                  <TableCell>$50.00</TableCell>
                  <TableCell>2 hours ago</TableCell>
                  <TableCell>
                    <Badge variant="default">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="default">Reply</Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Response form goes here */}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
                {/* ... */}
              </TableBody>
            </Table>
            {/* Pagination controls */}
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline">Previous</Button>
              <Button variant="outline">Next</Button>
            </div>
          </Card>
          {/* FAQ Editor */}
          <Card className="mb-8 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Manage FAQs</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">ℹ️</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Add FAQs to reduce escalations.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Button variant="default">Add FAQ</Button>
                <Button variant="outline">Import FAQs</Button>
              </div>
            </div>
            <Input placeholder="Search FAQs..." className="mb-4" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Map FAQs here */}
                <TableRow>
                  <TableCell>What’s the shipping time?</TableCell>
                  <TableCell>3-5 business days</TableCell>
                  <TableCell>Shipping</TableCell>
                  <TableCell>
                    <Button variant="outline">Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        {/* Confirm delete dialog */}
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
                {/* ... */}
              </TableBody>
            </Table>
          </Card>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
} 