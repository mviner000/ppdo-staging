"use client";

import { useState } from "react";
import Image from "next/image";

export default function PPDOAbout() {
  const [activeTab, setActiveTab] = useState<"mission" | "vision" | "quality">(
    "mission"
  );

  return (
    <section className="bg-[#f8f8f8] py-20 px-6" style={{ fontFamily: "var(--font-cinzel)" }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-14 items-start">

        {/* LEFT CONTENT */}
        <div>
          <p className="uppercase tracking-widest text-sm text-gray-700 mb-2">
            About
          </p>

          <h2 className="text-3xl md:text-4xl font-bold text-[#012130] mb-4">
            PPDO
          </h2>

          <p className="text-gray-800 leading-relaxed mb-10">
            The Provincial Planning and Development Office of the City
            Government of Tarlac is dedicated to providing efficient,
            transparent, and citizen-centered public service. The office
            plays a vital role in policy formulation, planning, and
            sustainable development initiatives of the city.
          </p>

          {/* TABS */}
          <div className="flex gap-10 border-b border-gray-300 mb-6">
            <button
              onClick={() => setActiveTab("mission")}
              className={`pb-2 font-semibold ${
                activeTab === "mission"
                  ? "text-[#012130] border-b-2 border-[#012130]"
                  : "text-gray-500"
              }`}
            >
              MISSION
            </button>

            <button
              onClick={() => setActiveTab("vision")}
              className={`pb-2 font-semibold ${
                activeTab === "vision"
                  ? "text-[#012130] border-b-2 border-[#012130]"
                  : "text-gray-500"
              }`}
            >
              VISION
            </button>

            <button
              onClick={() => setActiveTab("quality")}
              className={`pb-2 font-semibold ${
                activeTab === "quality"
                  ? "text-[#0c3823] border-b-2 border-[#012130]"
                  : "text-gray-500"
              }`}
            >
              QUALITY POLICY
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="text-gray-800 leading-relaxed">
            {activeTab === "mission" && (
              <p>
                The City Government of Tarlac is committed to providing
                efficient, transparent, and citizen-centered public service
                through sound planning, development coordination, and policy
                support that promotes inclusive and sustainable growth.
              </p>
            )}

            {activeTab === "vision" && (
              <p>
                A progressive and resilient City of Tarlac with balanced
                development, empowered communities, and responsive governance
                driven by strategic planning and innovation.
              </p>
            )}

            {activeTab === "quality" && (
              <p>
                We commit to continuously improve our services through
                effective planning systems, compliance with regulatory
                standards, and a culture of excellence, accountability, and
                professionalism.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
            <Image
              src="/placeholder.jpg"
              alt="PPDO Department"
              width={700}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
