// app/dashboard/security/components/BlockedItems.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type BlockType = "ip" | "email";

export function BlockedItemsManagement() {
  const [activeTab, setActiveTab] = useState<BlockType>("ip");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("ip");
  
  // Form states
  const [blockValue, setBlockValue] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockNotes, setBlockNotes] = useState("");
  const [unblockNotes, setUnblockNotes] = useState("");

  // Queries
  const blockedIPs = useQuery(api.blockedManagement.getBlockedIPs, {
    includeInactive: showInactive,
  });
  const blockedEmails = useQuery(api.blockedManagement.getBlockedEmails, {
    includeInactive: showInactive,
  });

  // Mutations
  const unblockIP = useMutation(api.blockedManagement.unblockIP);
  const unblockEmail = useMutation(api.blockedManagement.unblockEmail);
  const blockIPMutation = useMutation(api.loginTrail.blockIPAddress);
  const blockEmailMutation = useMutation(api.loginTrail.blockEmail);

  // Calculate stats
  const activeIPCount = blockedIPs?.filter((ip) => ip.isActive).length || 0;
  const activeEmailCount = blockedEmails?.filter((email) => email.isActive).length || 0;
  const totalIPCount = blockedIPs?.length || 0;
  const totalEmailCount = blockedEmails?.length || 0;

  const handleViewDetails = (item: any, type: BlockType) => {
    setSelectedItem({ ...item, type });
    setShowDetailsDialog(true);
  };

  const handleUnblockClick = (item: any, type: BlockType) => {
    setSelectedItem({ ...item, type });
    setUnblockNotes("");
    setShowUnblockDialog(true);
  };

  const handleUnblock = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === "ip") {
        await unblockIP({
          blockId: selectedItem._id,
          notes: unblockNotes || undefined,
        });
        toast.success("IP address unblocked successfully");
      } else {
        await unblockEmail({
          blockId: selectedItem._id,
          notes: unblockNotes || undefined,
        });
        toast.success("Email address unblocked successfully");
      }
      setShowUnblockDialog(false);
      setSelectedItem(null);
      setUnblockNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to unblock");
    }
  };

  const handleBlockSubmit = async () => {
    if (!blockValue.trim() || !blockReason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (blockType === "ip") {
        await blockIPMutation({
          ipAddress: blockValue.trim(),
          reason: blockReason.trim(),
          notes: blockNotes.trim() || undefined,
        });
        toast.success("IP address blocked successfully");
      } else {
        await blockEmailMutation({
          email: blockValue.trim(),
          reason: blockReason.trim(),
          notes: blockNotes.trim() || undefined,
        });
        toast.success("Email address blocked successfully");
      }
      setShowBlockDialog(false);
      setBlockValue("");
      setBlockReason("");
      setBlockNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to block");
    }
  };

  const openBlockDialog = (type: BlockType) => {
    setBlockType(type);
    setBlockValue("");
    setBlockReason("");
    setBlockNotes("");
    setShowBlockDialog(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Active Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {activeIPCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {totalIPCount} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Active Blocked Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {activeEmailCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {totalEmailCount} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Blocked Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {activeIPCount + activeEmailCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Inactive Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {(totalIPCount - activeIPCount) + (totalEmailCount - activeEmailCount)}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Previously blocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blocked Items Management</CardTitle>
              <CardDescription>
                Manage blocked IP addresses and email addresses
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
                className="gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showInactive ? "Hide Inactive" : "Show Inactive"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BlockType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ip" className="gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                Blocked IPs ({activeIPCount})
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Blocked Emails ({activeEmailCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ip" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => openBlockDialog("ip")} className="gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Block IP Address
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Blocked By</TableHead>
                      <TableHead>Blocked Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedIPs && blockedIPs.length > 0 ? (
                      blockedIPs.map((ip) => (
                        <TableRow key={ip._id}>
                          <TableCell className="font-mono text-sm">
                            {ip.ipAddress}
                          </TableCell>
                          <TableCell>
                            {ip.isActive ? (
                              <Badge variant="destructive" className="gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {ip.reason}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {ip.blockedByName || "Unknown"}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {ip.blockedByEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-zinc-900 dark:text-zinc-100">
                                {formatDate(ip.blockedAt)}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatRelativeTime(ip.blockedAt)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(ip, "ip")}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </Button>
                              {ip.isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnblockClick(ip, "ip")}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                    />
                                  </svg>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-zinc-500 dark:text-zinc-400">
                            No blocked IP addresses found
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => openBlockDialog("email")} className="gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Block Email Address
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Blocked By</TableHead>
                      <TableHead>Blocked Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedEmails && blockedEmails.length > 0 ? (
                      blockedEmails.map((email) => (
                        <TableRow key={email._id}>
                          <TableCell className="font-medium">
                            {email.email}
                          </TableCell>
                          <TableCell>
                            {email.isActive ? (
                              <Badge variant="destructive" className="gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {email.reason}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {email.blockedByName || "Unknown"}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {email.blockedByEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-zinc-900 dark:text-zinc-100">
                                {formatDate(email.blockedAt)}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatRelativeTime(email.blockedAt)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(email, "email")}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </Button>
                              {email.isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnblockClick(email, "email")}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                                    />
                                  </svg>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-zinc-500 dark:text-zinc-400">
                            No blocked email addresses found
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Block Details</DialogTitle>
            <DialogDescription>
              Complete information about this blocked item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedItem.type === "ip" ? "IP Address" : "Email Address"}
                  </Label>
                  <div className="font-mono text-sm font-medium mt-1">
                    {selectedItem.type === "ip" ? selectedItem.ipAddress : selectedItem.email}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">Status</Label>
                  <div className="mt-1">
                    {selectedItem.isActive ? (
                      <Badge variant="destructive">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-zinc-500 dark:text-zinc-400">Reason</Label>
                <div className="text-sm mt-1">{selectedItem.reason}</div>
              </div>

              {selectedItem.notes && (
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">Notes</Label>
                  <div className="text-sm mt-1 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-md">
                    {selectedItem.notes}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">Blocked By</Label>
                  <div className="text-sm mt-1">
                    <div className="font-medium">{selectedItem.blockedByName}</div>
                    <div className="text-xs text-zinc-500">{selectedItem.blockedByEmail}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">Blocked Date</Label>
                  <div className="text-sm mt-1">{formatDate(selectedItem.blockedAt)}</div>
                </div>
              </div>

              {!selectedItem.isActive && selectedItem.unblockedAt && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Unblocked By
                    </Label>
                    <div className="text-sm mt-1">
                      <div className="font-medium">{selectedItem.unblockedByName}</div>
                      <div className="text-xs text-zinc-500">
                        {selectedItem.unblockedByEmail}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                      Unblocked Date
                    </Label>
                    <div className="text-sm mt-1">
                      {formatDate(selectedItem.unblockedAt)}
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.expiresAt && (
                <div>
                  <Label className="text-xs text-zinc-500 dark:text-zinc-400">
                    Expires At
                  </Label>
                  <div className="text-sm mt-1">{formatDate(selectedItem.expiresAt)}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Dialog */}
      <AlertDialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {selectedItem?.type === "ip" ? "IP" : "Email"} Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow access from{" "}
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {selectedItem?.type === "ip" ? selectedItem?.ipAddress : selectedItem?.email}
              </span>
              . You can add notes about this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="unblock-notes">Notes (Optional)</Label>
            <Textarea
              id="unblock-notes"
              value={unblockNotes}
              onChange={(e) => setUnblockNotes(e.target.value)}
              placeholder="Add any relevant notes about unblocking this item..."
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>
              Unblock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {blockType === "ip" ? "IP" : "Email"} Address</DialogTitle>
            <DialogDescription>
              Add a new {blockType === "ip" ? "IP" : "email"} address to the block list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="block-value">
                {blockType === "ip" ? "IP Address" : "Email Address"} *
              </Label>
              <Input
                id="block-value"
                type={blockType === "ip" ? "text" : "email"}
                value={blockValue}
                onChange={(e) => setBlockValue(e.target.value)}
                placeholder={
                  blockType === "ip" ? "192.168.1.1" : "user@example.com"
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="block-reason">Reason *</Label>
              <Input
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Multiple failed login attempts"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="block-notes">Notes (Optional)</Label>
              <Textarea
                id="block-notes"
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockSubmit} variant="destructive">
              Block {blockType === "ip" ? "IP" : "Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}