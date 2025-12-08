"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { LoginTrail } from "./components/LoginTrail";
import { MiniGauge } from "./components/MiniGauge";
import { SpeedometerCard } from "./components/SpeedometerCard";
import { BarChartCard } from "./components/BarChartCard";
import { OfficeSelect } from "./components/OfficeSelect";
import { useMemo, useState } from "react";
import { PersonalKPICard } from "./components/PersonalKPICard";

export default function Dashboard() {
  const OFFICES = [
    // 1-24 based on your image, abbreviated
    "OPA", // Office of the Provincial Administrator
    "HRMO", // Provincial Human Resource Management Office
    "PCEDO", // Provincial Cooperative & Enterprise Dev't Office
    "PPDO", // Provincial Planning & Development Office
    "PTourO", // Provincial Tourism Office
    "PENRO", // Provincial Environment & Natural Resources Office
    "GSO", // Provincial General Services Office
    "PEPO", // Provincial Equipment Pool Office
    "PEO", // Provincial Engineering Office
    "PIO", // Provincial Information Office
    "PAgO", // Provincial Agriculture Office
    "PTreasO", // Provincial Treasury Office
    "PVO", // Provincial Veterinary Office
    "PACCO", // Provincial Accounting Office
    "PAssO", // Provincial Assessor's Office
    "PLO", // Provincial Legal Office
    "PSWDO", // Provincial Social Welfare & Development Office
    "TPH", // Tarlac Provincial Hospital
    "PHO", // Provincial Health Office
    "GOTMH", // Gilberto O. Teodoro Memorial Hospital
    "CDH", // Concepcion District Hospital
    "LPMCH", // La Paz Medicare & Community Hospital
    "EHMCMH", // Enrique "Henry" M. Cojuangco Memorial Hospital
    "PESO", // Provincial Public Employment Service Office
    "PDRRMO", // Provincial Disaster Risk Reduction and Management Office
    "PBO", // Provincial Budget Office
    "OSSP", // Office of the Secretary to the Sangguniang Panlalawigan
    "OPVG", // Office of the Provincial Vice Governor
  ];
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);

  // Deterministic per-office metrics so UI updates on selection
  const officePercent = useMemo(() => {
    return (office: string, min = 40, max = 90) => {
      if (!office) return 0;
      const code = office.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const span = max - min;
      return Math.round(min + (code % (span + 1)));
    };
  }, []);

  const completionValue = useMemo(() => {
    return selectedOffice ? officePercent(selectedOffice, 50, 95) : 60;
  }, [selectedOffice, officePercent]);

  const utilizationValue = useMemo(() => {
    return selectedOffice ? officePercent(selectedOffice, 45, 85) : 52;
  }, [selectedOffice, officePercent]);

  const physicalData = useMemo(() => {
    if (!selectedOffice) {
      return [
        { label: "MO", value: 45 },
        { label: "SB", value: 68 },
        { label: "MHRMO", value: 72 },
        { label: "MPDO", value: 58 },
        { label: "MCR", value: 80 },
        { label: "MBO", value: 61 },
        { label: "MAO", value: 77 },
        { label: "MTO", value: 64 },
        { label: "PESO", value: 70 },
      ];
    }
    return [
      { label: selectedOffice, value: officePercent(selectedOffice, 40, 90) },
    ];
  }, [selectedOffice, officePercent]);

  const financialData = useMemo(() => {
    if (!selectedOffice) {
      return [
        { label: "MO", value: 40 },
        { label: "SB", value: 55 },
        { label: "MHRMO", value: 62 },
        { label: "MPDO", value: 47 },
        { label: "MCR", value: 74 },
        { label: "MBO", value: 51 },
        { label: "MAO", value: 69 },
        { label: "MTO", value: 60 },
        { label: "PESO", value: 66 },
      ];
    }
    return [
      { label: selectedOffice, value: officePercent(selectedOffice, 35, 85) },
    ];
  }, [selectedOffice, officePercent]);
  const router = useRouter();

  return (
    <>
      {/* Page Header */}
      <div className="mb-4">
        <h1
          className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Overview of planning and development activities
        </p>
      </div>

      {/* PPDO Banner */}
      <div className="mb-6">
        <div className="relative w-full h-40 sm:h-48 lg:h-56 xl:h-64 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Image
            src="https://c0.wallpaperflare.com/preview/934/635/785/blond-hair-cellphone-cheerful-device.jpg"
            alt="PPDO Banner"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* (moved) */}

      {/* Gauges + Bar Charts + Status Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: status blocks */}
        <div className="lg:col-span-3 space-y-6">
          {/* Client Satisfaction / Overall Score */}
          <div className="bg-[#f8f8f8] dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between">
        <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Client Satisfaction Rating
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Latest survey
                </p>
              </div>
              <p
                className="text-5xl font-bold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                92%
              </p>
            </div>
          </div>

          {/* Office Selection - searchable combobox */}
          <OfficeSelect
            offices={OFFICES}
            value={selectedOffice}
            onChange={setSelectedOffice}
          />

          {/* SGLG Data / Others */}
          <div className="bg-[#f8f8f8] dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              SGLG Data
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <MiniGauge title="SC Compliant" value={88} />
              <MiniGauge title="DRR Compliant" value={79} />
              <MiniGauge title="FIN Compliant" value={83} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniGauge title="Accomplishment - PS" value={72} />
              <MiniGauge title="Accomplishment - LCCF" value={66} />
            </div>
          </div>
        </div>

        {/* Middle: bar charts */}
        <div className="lg:col-span-6 space-y-6">
          <BarChartCard
            title="Physical Accomplishment"
            subtitle={selectedOffice ? `for ${selectedOffice}` : "by Office"}
            className="min-h-[315px]"
            data={physicalData}
          />
          <BarChartCard
            title="Financial Accomplishment"
            subtitle={selectedOffice ? `for ${selectedOffice}` : "by Office"}
            className="min-h-[315px]"
            data={financialData}
                  />
        </div>

        {/* Right: two primary gauges */}
        <div className="lg:col-span-3 space-y-6">
          <SpeedometerCard
            title="Overall Completion Rate"
            value={completionValue}
            subtitle="As of YTD"
            color="green"
          />
          <SpeedometerCard
            title="Overall Utilization Rate"
            value={utilizationValue}
            subtitle="Budget utilization"
            color="blue"
            />
          </div>

        {/* Horizontal Status of Mandatory Fund full width row */}
        <div className="lg:col-span-12">
          <div className="bg-[#f8f8f8] dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                Status of Mandatory Fund
              </h3>
              <div className="text-xs text-zinc-500">Physical vs Financial</div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Physical grid */}
              <div className="min-w-0">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  Physical Accomplishment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MiniGauge title="20% LDF" value={56} />
                  <MiniGauge title="5% MDRRMF" value={61} />
                  <MiniGauge title="5% GAD" value={49} />
                  <MiniGauge title="Trust Fund" value={73} />
                </div>
              </div>
              {/* Financial grid */}
              <div className="min-w-0">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  Financial Accomplishment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MiniGauge title="20% LDF" value={35} />
                  <MiniGauge title="5% MDRRMF" value={46} />
                  <MiniGauge title="5% GAD" value={42} />
                  <MiniGauge title="Trust Fund" value={58} />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Overall Performance Score and Login Trail (below main section) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <PersonalKPICard
              metrics={[
                {
                  title: "Productivity Score",
                  value: 87,
                  icon: (
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  ),
                  subtitle: "Task completion rate",
                  color: "green",
                },
                {
                  title: "Quality Score",
                  value: 92,
                  icon: (
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  subtitle: "Work accuracy rate",
                  color: "blue",
                },
                {
                  title: "Timeliness Score",
                  value: 81,
                  icon: (
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  subtitle: "On-time completion",
                  color: "orange",
                },
                {
                  title: "Compliance Score",
                  value: 95,
                  icon: (
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  subtitle: "Policy adherence",
                  color: "green",
                },
              ]}
            />
          </div>
          <div>
            <LoginTrail />
        </div>
      </div>
    </>
  );
}