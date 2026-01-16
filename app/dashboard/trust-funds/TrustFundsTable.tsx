"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Trash2, Search, Printer, Share2 } from "lucide-react";
import { TrustFund } from "./types";

type Props = {
  data: TrustFund[];
};

export default function TrustFundsTable({ data }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const allSelected = selected.length === data.length && data.length > 0;

  const toggleAll = () =>
    setSelected(allSelected ? [] : data.map((item) => item.id));

  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const totals = data.reduce(
    (acc, item) => {
      acc.received += item.received;
      acc.obligatedPR += item.obligatedPR;
      acc.utilized += item.utilized;
      acc.balance += item.balance;
      return acc;
    },
    { received: 0, obligatedPR: 0, utilized: 0, balance: 0 }
  );

  return (
    <Card className="rounded-lg border">
      {/* ================= HEADER ================= */}
      <CardHeader className="border-b px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground">
            TRUST FUNDS
          </h2>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-blue-600">
              <Trash2 className="h-4 w-4 mr-1" />
              Recycle Bin
            </Button>

            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>

            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              Add New Item
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ================= TABLE ================= */}
      <CardContent className="p-0">
        <div className="relative max-h-[400px] overflow-auto">
          <Table className="w-full table-fixed text-sm">
            {/* COLUMN WIDTH LOCK */}
            <colgroup>
              <col className="w-[44px]" />
              <col className="w-[260px]" />
              <col className="w-[200px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[160px]" />
              <col className="w-[200px]" />
            </colgroup>

            {/* ================= TABLE HEAD ================= */}
            <TableHeader className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-950">
              <TableRow className="h-10 border-b">
                <TableHead className="px-2 text-center">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>

                {[
                  "PROJECT TITLE",
                  "OFFICE IN-CHARGE",
                  "DATE RECEIVED",
                ].map((header) => (
                  <TableHead
                    key={header}
                    className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium"
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    </div>
                  </TableHead>
                ))}

                {[
                  "RECEIVED",
                  "OBLIGATED PR",
                  "UTILIZED",
                  "BALANCES",
                ].map((header) => (
                  <TableHead
                    key={header}
                    className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium text-right"
                  >
                    {/* FULL WIDTH HEADER ALIGNMENT FIX */}
                    <div className="flex w-full items-center justify-end gap-1">
                      {header}
                      <ArrowUpDown className="h-3 w-3 opacity-40 shrink-0" />
                    </div>
                  </TableHead>
                ))}

                <TableHead className="px-3 uppercase text-[11px] tracking-wide text-muted-foreground font-medium">
                  REMARKS
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* ================= TABLE BODY ================= */}
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="h-10 hover:bg-muted/40">
                  <TableCell className="px-2 text-center">
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                    />
                  </TableCell>

                  <TableCell className="px-3 font-medium truncate">
                    {item.projectTitle}
                  </TableCell>

                  <TableCell className="px-3 truncate">
                    {item.officeInCharge}
                  </TableCell>

                  <TableCell className="px-3">
                    {item.dateReceived}
                  </TableCell>

                  <TableCell className="px-3 text-right tabular-nums">
                    ₱{item.received.toLocaleString()}
                  </TableCell>

                  <TableCell className="px-3 text-right tabular-nums">
                    ₱{item.obligatedPR.toLocaleString()}
                  </TableCell>

                  <TableCell className="px-3 text-right tabular-nums">
                    ₱{item.utilized.toLocaleString()}
                  </TableCell>

                  <TableCell className="px-3 text-right font-semibold tabular-nums">
                    ₱{item.balance.toLocaleString()}
                  </TableCell>

                  <TableCell className="px-3 text-muted-foreground truncate">
                    {item.remarks}
                  </TableCell>
                </TableRow>
              ))}

              {/* ================= TOTAL ROW ================= */}
              <TableRow className="border-t bg-muted/30 font-semibold h-11">
                <TableCell />

                <TableCell colSpan={3} className="px-3">
                  TOTAL
                </TableCell>

                <TableCell className="px-3 text-right tabular-nums">
                  ₱{totals.received.toLocaleString()}
                </TableCell>

                <TableCell className="px-3 text-right tabular-nums">
                  ₱{totals.obligatedPR.toLocaleString()}
                </TableCell>

                <TableCell className="px-3 text-right tabular-nums">
                  ₱{totals.utilized.toLocaleString()}
                </TableCell>

                <TableCell className="px-3 text-right tabular-nums">
                  ₱{totals.balance.toLocaleString()}
                </TableCell>

                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
