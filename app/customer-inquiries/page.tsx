"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useFaqs } from "@/hooks/useFaqs";
import { useToast } from "@/hooks/use-toast";
import type { Inquiry } from "@/types/supabase";
import { Search, MoreHorizontal, Mail, MessageSquare, RefreshCw, Plus, Edit, Trash2, Filter, ChevronDown, CheckCircle, Clock, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/ui/dashboard-layout";
import type { FAQ } from "@/types/supabase";

// Response templates for replies
const RESPONSE_TEMPLATES = [
  "Yes, we can accommodate that!",
  "Please clarify your request.",
  "Thank you for your inquiry. We'll get back to you soon.",
  "This is a common question. Please see our FAQ section.",
  "We appreciate your feedback!"
];

// Format time difference for display
const formatTimeAgo = (dateString: string) => {
  if (typeof window === 'undefined') return ''; // Skip on server to avoid SSR mismatch
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Skeleton component for loading state
const CustomerInquiriesSkeleton = () => (
  <div className="flex flex-col gap-8">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="mt-2 h-4 w-80 rounded-md" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>
    <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      ))}
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
          <Skeleton className="h-10 w-[100px] rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-[80px] rounded-full" />
              <Skeleton className="h-8 w-[60px] ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
          <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-[120px] rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/4" />
              <Skeleton className="h-4 w-1/6" />
              <div className="flex gap-2 ml-auto">
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function CustomerInquiriesPage() {
  // --- State and Handlers ---
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => { setHydrated(true); }, []);
  const SHOP_ID = 'd5a79116-842f-4a4b-afd6-a4bb225119cf';
  const { faqs, loading: loadingFaqs, error: faqsError, refetch: refetchFaqs, addFaq, updateFaq, deleteFaq } = useFaqs(SHOP_ID);
  const { toast } = useToast();
  // State for Inquiries
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = React.useState(true);
  const [inquiriesError, setInquiriesError] = React.useState<string | null>(null);
  // Fetch inquiries logic
  const fetchInquiries = React.useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      console.log('Fetched inquiries:', data);
        setInquiries(data.inquiries || []);
        setInquiriesError(data.error || null);
    } catch (err) {
      setInquiriesError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoadingInquiries(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);
  React.useEffect(() => {
    console.log('faqs from hook:', faqs);
  }, [faqs]);
  // State for FAQs
  const [faqSearchTerm, setFaqSearchTerm] = React.useState("");
  const [isAddFaqDialogOpen, setIsAddFaqDialogOpen] = React.useState(false);
  const [isEditFaqDialogOpen, setIsEditFaqDialogOpen] = React.useState(false);
  const [selectedFaq, setSelectedFaq] = React.useState<FAQ | null>(null);
  const [newFaqQuestion, setNewFaqQuestion] = React.useState("");
  const [newFaqAnswer, setNewFaqAnswer] = React.useState("");
  const [newFaqCategory, setNewFaqCategory] = React.useState("");
  const [isSavingFaq, setIsSavingFaq] = React.useState(false);
  const [isDeletingFaq, setIsDeletingFaq] = React.useState(false);
  // Add missing state for inquiries search and filter
  const [inquirySearchTerm, setInquirySearchTerm] = React.useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = React.useState("all");
  // Add missing state for reply dialog and selected inquiry
  const [selectedInquiry, setSelectedInquiry] = React.useState<Inquiry | null>(null);
  const [responseMessage, setResponseMessage] = React.useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = React.useState(false);
  const [isSendingReply, setIsSendingReply] = React.useState(false);
  // Add state for viewing full summary dialog
  const [isViewSummaryDialogOpen, setIsViewSummaryDialogOpen] = React.useState(false);
  const [viewSummaryInquiry, setViewSummaryInquiry] = React.useState<Inquiry | null>(null);
  // Add state for FAQ upload dialog
  const [isUploadFaqDialogOpen, setIsUploadFaqDialogOpen] = React.useState(false);
  const [isUploadingFaq, setIsUploadingFaq] = React.useState(false);
  const [faqUploadFile, setFaqUploadFile] = React.useState<File | null>(null);
  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquirySearchTerm === "" ||
      (inquiry.customer_email?.toLowerCase() || "").includes(inquirySearchTerm.toLowerCase()) ||
      (inquiry.query_summary?.toLowerCase() || "").includes(inquirySearchTerm.toLowerCase());
    const matchesStatus = inquiryStatusFilter === "all" || inquiry.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });
  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(faqSearchTerm.toLowerCase())
  );
  // Handlers
  const handleReplyToInquiry = async () => {
    if (!selectedInquiry || !responseMessage) {
      toast({ title: "Error", description: "Please enter a response message.", variant: "destructive" });
      return;
    }
    setIsSendingReply(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        toast({ title: "Reply Sent", description: `Response sent to ${selectedInquiry.customer_email}.` });
        setIsReplyDialogOpen(false);
        setResponseMessage("");
    } catch (err) {
      toast({ title: "Error", description: `Failed to send reply. ${err instanceof Error ? err.message : ""}`, variant: "destructive" });
    } finally {
      setIsSendingReply(false);
    }
  };
  const handleMarkAsResolved = async (inquiryId: string) => {
    try {
      toast({ title: "Inquiry Resolved", description: `Inquiry ${inquiryId} marked as resolved.` });
    } catch (err) {
      toast({ title: "Error", description: `Failed to mark inquiry as resolved. ${err instanceof Error ? err.message : ""}`, variant: "destructive" });
    }
  };
  const handleSyncInquiries = async () => {
    await fetchInquiries();
    toast({ title: "Inquiries Synced", description: "Inquiry data has been refreshed." });
  };
  const handleAddFaq = async () => {
    if (!newFaqQuestion || !newFaqAnswer || !newFaqCategory) {
      toast({ title: "Error", description: "Please fill in all FAQ fields.", variant: "destructive" });
      return;
    }
    setIsSavingFaq(true);
    try {
      const success = await addFaq({ question: newFaqQuestion, answer: newFaqAnswer, category: newFaqCategory, shop_id: SHOP_ID });
      if (success) {
        toast({ title: "FAQ Added", description: "New FAQ has been added successfully." });
        setIsAddFaqDialogOpen(false);
        setNewFaqQuestion("");
        setNewFaqAnswer("");
        setNewFaqCategory("");
      } else throw new Error("Failed to add FAQ.");
    } catch (err) {
      toast({ title: "Error", description: `Failed to add FAQ. ${err instanceof Error ? err.message : ""}` , variant: "destructive" });
    } finally {
      setIsSavingFaq(false);
    }
  };
  const handleUpdateFaq = async () => {
    if (!selectedFaq || !newFaqQuestion || !newFaqAnswer || !newFaqCategory) {
      toast({ title: "Error", description: "Please fill in all FAQ fields.", variant: "destructive" });
      return;
    }
    setIsSavingFaq(true);
    try {
      const success = await updateFaq({
        ...selectedFaq,
        question: newFaqQuestion,
        answer: newFaqAnswer,
        category: newFaqCategory,
        created_at: selectedFaq.created_at,
        updated_at: new Date().toISOString(),
        shop_id: SHOP_ID,
      });
      if (success) {
        toast({ title: "FAQ Updated", description: "FAQ has been updated successfully." });
        setIsEditFaqDialogOpen(false);
        setSelectedFaq(null);
        setNewFaqQuestion("");
        setNewFaqAnswer("");
        setNewFaqCategory("");
      } else throw new Error("Failed to update FAQ.");
    } catch (err) {
      toast({ title: "Error", description: `Failed to update FAQ. ${err instanceof Error ? err.message : ""}`, variant: "destructive" });
    } finally {
      setIsSavingFaq(false);
    }
  };
  const handleDeleteFaq = async (faqId: string) => {
    setIsDeletingFaq(true);
    try {
      const success = await deleteFaq(faqId);
      if (success) toast({ title: "FAQ Deleted", description: "FAQ has been deleted successfully." });
      else throw new Error("Failed to delete FAQ.");
    } catch (err) {
      toast({ title: "Error", description: `Failed to delete FAQ. ${err instanceof Error ? err.message : ""}`, variant: "destructive" });
    } finally {
      setIsDeletingFaq(false);
    }
  };
  // Loading state
  if (!hydrated || loadingInquiries || loadingFaqs) {
    return (
      <DashboardLayout>
        <CustomerInquiriesSkeleton />
      </DashboardLayout>
    );
  }
  // Error state
  if (inquiriesError || faqsError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-8 p-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
            <p className="text-muted-foreground">Error loading data. Please try again.</p>
          </div>
          <Card className="border-destructive">
            <CardContent className="pt-6 flex flex-col items-center gap-4 text-destructive">
              <p>Error: {inquiriesError || faqsError}</p>
              <Button onClick={() => { fetchInquiries(); refetchFaqs(); }} variant="destructive">
                <RefreshCw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Inquiries</h1>
            <p className="text-muted-foreground">View and manage customer inquiries for your shop.</p>
            </div>
          </div>
          {/* Inquiries Table */}
        <Card className="w-full">
            <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
              <div className="min-w-0">
                <CardTitle>Inquiries</CardTitle>
                <CardDescription>All customer inquiries for your shop.</CardDescription>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                  <Input
                  placeholder="Search inquiries..."
                    value={inquirySearchTerm}
                  onChange={e => setInquirySearchTerm(e.target.value)}
                  className="w-48"
                  />
                <Select value={inquiryStatusFilter} onValueChange={setInquiryStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleSyncInquiries} className="border-green-600 text-green-700">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <div className="max-h-96 overflow-y-auto">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow><TableHead>Email</TableHead><TableHead>Summary</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-48 text-center"><div className="flex flex-col items-center gap-2"><Info className="h-12 w-12 text-muted-foreground/50" /><h3 className="font-semibold">No inquiries found</h3><p className="text-muted-foreground">Try adjusting your filters or check back later.</p></div></TableCell></TableRow>
                    ) : (
                      filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id} className="odd:bg-muted/50"><TableCell className="max-w-[200px] truncate align-top">{inquiry.customer_email}</TableCell><TableCell className="max-w-[300px] truncate align-top">{inquiry.query_summary}</TableCell><TableCell className="align-top">{inquiry.status}</TableCell><TableCell className="align-top">{formatTimeAgo(inquiry.created_at)}</TableCell><TableCell className="align-top"><div className="flex gap-2"><Button size="sm" onClick={() => { setSelectedInquiry(inquiry); setIsReplyDialogOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">Reply</Button><Button size="sm" variant="outline" onClick={() => { setViewSummaryInquiry(inquiry); setIsViewSummaryDialogOpen(true); }} className="border-green-600 text-green-700">View Full Summary</Button></div></TableCell></TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              </div>
            </CardContent>
          </Card>
        {/* FAQ Section */}
          <Card>
            <CardHeader>
            <CardTitle>FAQ Editor</CardTitle>
            <CardDescription>Manage frequently asked questions for your shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Input
                  placeholder="Search FAQs..."
                  value={faqSearchTerm}
                  onChange={(e) => setFaqSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsAddFaqDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add FAQ
                </Button>
                <Button variant="outline" onClick={refetchFaqs} className="border-green-600 text-green-700">
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button variant="secondary" onClick={() => setIsUploadFaqDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                  Upload FAQ File
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Question</TableHead><TableHead>Answer</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-32 text-center"><div className="flex flex-col items-center gap-2"><Info className="h-12 w-12 text-muted-foreground/50" /><h3 className="font-semibold">No FAQs found</h3><p className="text-muted-foreground">Try adjusting your search or add a new FAQ.</p></div></TableCell></TableRow>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <TableRow key={faq.id} className="odd:bg-muted/50"><TableCell className="max-w-[200px] truncate">{faq.question}</TableCell><TableCell className="max-w-[300px] truncate">{faq.answer}</TableCell><TableCell>{faq.category}</TableCell><TableCell className="text-right"><Button variant="ghost" className="h-8 w-8 p-0 border-green-600 text-green-700" onClick={() => { setSelectedFaq(faq); setNewFaqQuestion(faq.question); setNewFaqAnswer(faq.answer); setNewFaqCategory(faq.category); setIsEditFaqDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" className="h-8 w-8 p-0 text-destructive border-green-600 text-green-700" onClick={() => handleDeleteFaq(faq.id)} disabled={isDeletingFaq}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Dialogs */}
      <Dialog open={isAddFaqDialogOpen} onOpenChange={setIsAddFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>Fill in the details for the new FAQ.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Question" value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} className="mb-2" />
          <Textarea placeholder="Answer" value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} className="mb-2" />
          <Input placeholder="Category" value={newFaqCategory} onChange={(e) => setNewFaqCategory(e.target.value)} className="mb-2" />
          <DialogFooter>
            <Button onClick={handleAddFaq} disabled={isSavingFaq} className="bg-green-600 hover:bg-green-700 text-white">
              {isSavingFaq ? "Saving..." : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditFaqDialogOpen} onOpenChange={setIsEditFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the details for this FAQ.</DialogDescription>
          </DialogHeader>
          <Input placeholder="Question" value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} className="mb-2" />
          <Textarea placeholder="Answer" value={newFaqAnswer} onChange={(e) => setNewFaqAnswer(e.target.value)} className="mb-2" />
          <Input placeholder="Category" value={newFaqCategory} onChange={(e) => setNewFaqCategory(e.target.value)} className="mb-2" />
          <DialogFooter>
            <Button onClick={handleUpdateFaq} disabled={isSavingFaq} className="bg-green-600 hover:bg-green-700 text-white">
              {isSavingFaq ? "Saving..." : "Update FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>Send a response to {selectedInquiry?.customer_email}.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your response..."
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            className="mb-2"
          />
          <DialogFooter>
            <Button onClick={handleReplyToInquiry} disabled={isSendingReply} className="bg-green-600 hover:bg-green-700 text-white">
              {isSendingReply ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewSummaryDialogOpen} onOpenChange={setIsViewSummaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry Summary</DialogTitle>
            <DialogDescription>Full details for this inquiry.</DialogDescription>
          </DialogHeader>
          {viewSummaryInquiry && (
            <div className="space-y-2">
              <div><strong>Summary:</strong> {viewSummaryInquiry.query_summary}</div>
              {viewSummaryInquiry.full_query && (
                <div><strong>Full Query:</strong> {viewSummaryInquiry.full_query}</div>
              )}
              <div><strong>Customer Email:</strong> {viewSummaryInquiry.customer_email || '-'}</div>
              <div><strong>Status:</strong> {viewSummaryInquiry.status}</div>
              <div><strong>Created At:</strong> {formatTimeAgo(viewSummaryInquiry.created_at)}</div>
              <div><strong>Cart Value:</strong> {viewSummaryInquiry.cart_value !== undefined && viewSummaryInquiry.cart_value !== null ? `$${viewSummaryInquiry.cart_value}` : '-'}</div>
              <div><strong>Currency:</strong> {viewSummaryInquiry.currency || '-'}</div>
              <div><strong>Shop ID:</strong> {viewSummaryInquiry.shop_id}</div>
              <div><strong>Inquiry ID:</strong> {viewSummaryInquiry.id}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isUploadFaqDialogOpen} onOpenChange={setIsUploadFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload FAQ File</DialogTitle>
            <DialogDescription>Upload a text file (.txt) to bulk import FAQs. Format: Q: Question? A: Answer Category: Category Name</DialogDescription>
          </DialogHeader>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={e => setFaqUploadFile(e.target.files?.[0] || null)}
            disabled={isUploadingFaq}
            className="mb-4"
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!faqUploadFile) {
                  toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
                  return;
                }
                setIsUploadingFaq(true);
                const formData = new FormData();
                formData.append('file', faqUploadFile);
                try {
                  const res = await fetch(`/api/upload-faq-file?shop_id=${SHOP_ID}`, { method: 'POST', body: formData });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    toast({ title: "Upload Successful", description: data.message });
                    setIsUploadFaqDialogOpen(false);
                    setFaqUploadFile(null);
                    refetchFaqs();
                  } else {
                    toast({ title: "Upload Failed", description: data.error || 'Unknown error', variant: "destructive" });
                  }
                } catch (err) {
                  toast({ title: "Upload Failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
                } finally {
                  setIsUploadingFaq(false);
                }
              }}
              disabled={isUploadingFaq || !faqUploadFile}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUploadingFaq ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}