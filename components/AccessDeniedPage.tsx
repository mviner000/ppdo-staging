// components/AccessDeniedPage.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldX, CheckCircle2, User, Mail, Building2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface AccessDeniedPageProps {
  userName?: string;
  userEmail?: string;
  departmentName?: string;
  pageRequested?: string;
}

export default function AccessDeniedPage({
  userName = "",
  userEmail = "",
  departmentName = "Not Assigned",
  pageRequested = "Budget Tracking",
}: AccessDeniedPageProps) {
  const router = useRouter();
  const createAccessRequest = useMutation(api.accessRequests.create);

  const [accessType, setAccessType] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessType || !reason.trim()) {
      alert("Please select access type and provide a reason");
      return;
    }

    try {
      setIsSubmitting(true);
      await createAccessRequest({
        pageRequested,
        accessType,
        reason,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting access request:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit access request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
        <Card className="shadow-lg border-slate-200 dark:border-zinc-800 max-w-md w-full">
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              Request Submitted
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-zinc-400">
              Your access request has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-zinc-400 text-center">
              An administrator will review your request and respond via email.
              You will be notified once a decision has been made.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg border-slate-200 dark:border-zinc-800">
          <CardHeader className="space-y-4">
            {/* SVG Illustration - Now at top */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Circle */}
                  <circle cx="100" cy="100" r="90" fill="#f1f5f9" className="dark:fill-zinc-800" />

                  {/* Document Stack */}
                  <rect x="60" y="70" width="80" height="100" rx="4" fill="#cbd5e1" className="dark:fill-zinc-700" />
                  <rect x="55" y="65" width="80" height="100" rx="4" fill="#e2e8f0" className="dark:fill-zinc-600" />
                  <rect
                    x="50"
                    y="60"
                    width="80"
                    height="100"
                    rx="4"
                    fill="white"
                    className="dark:fill-zinc-900"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />

                  {/* Document Lines */}
                  <line x1="60" y1="75" x2="120" y2="75" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="60" y1="85" x2="110" y2="85" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="60" y1="95" x2="120" y2="95" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="60" y1="105" x2="100" y2="105" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

                  {/* Shield with X */}
                  <circle cx="100" cy="120" r="25" fill="#ef4444" opacity="0.9" />
                  <circle cx="100" cy="120" r="21" fill="white" className="dark:fill-zinc-900" />

                  {/* X Mark */}
                  <line
                    x1="92"
                    y1="112"
                    x2="108"
                    y2="128"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="108"
                    y1="112"
                    x2="92"
                    y2="128"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Lock Icon */}
                  <rect x="95" y="135" width="10" height="12" rx="1.5" fill="#64748b" />
                  <path
                    d="M 97.5 135 L 97.5 130 A 2.5 2.5 0 0 1 102.5 130 L 102.5 135"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <ShieldX className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
                  Access Denied
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-slate-600 dark:text-zinc-400 text-center leading-snug">
                You don’t have access to this page.{" "}
                <span className="font-semibold">{pageRequested}</span> is restricted to approved users only.
                If you believe you should have access, please complete the form below to request permission.
              </CardDescription>

            </div>

          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Information - Display Only */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">
                  Your Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-1 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-zinc-500">
                        Email Address
                      </Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 break-all">
                        {userEmail || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 mt-1 text-slate-500 dark:text-zinc-400" />
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-zinc-500">
                        Department / Office
                      </Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                        {departmentName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {/* Request Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Access Type <span className="text-red-500">*</span>
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Viewer */}
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox
                        id="viewer"
                        checked={accessType === "viewer"}
                        onCheckedChange={() => setAccessType("viewer")}
                      />
                      <label
                        htmlFor="viewer"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Viewer
                        <span className="block text-xs text-slate-500 dark:text-zinc-400">
                          Read only
                        </span>
                      </label>
                    </div>

                    {/* Editor */}
                    <div className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox
                        id="editor"
                        checked={accessType === "editor"}
                        onCheckedChange={() => setAccessType("editor")}
                      />
                      <label
                        htmlFor="editor"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Editor
                        <span className="block text-xs text-slate-500 dark:text-zinc-400">
                          Can modify
                        </span>
                      </label>
                    </div>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Reason for Access <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Example: I need to review budget allocations for my department's quarterly report"
                    className="bg-white dark:bg-zinc-950 min-h-[100px] resize-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Go Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}