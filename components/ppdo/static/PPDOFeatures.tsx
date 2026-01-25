"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotepadText,
  ToolCase,
  Activity,
  Handshake,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ModalItem = {
  title: string;
  image: string;
  href: string;
};

type Feature = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  thumbnail: string;
  items: ModalItem[];
};

export default function PPDOFeatures() {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  const features: Feature[] = [
    {
      title: "Main planning arm of the Provincial Government of Tarlac.",
      subtitle: "Provincial Planning",
      icon: NotepadText,
      thumbnail: "/planning.jpg",
      items: [
        { title: "Provincial Development Plan", image: "/features/1item1.png", href: "/news-events" },
        { title: "Spatial Framework", image: "/features/1item2.png", href: "/news-events" },
        { title: "Investment Programming", image: "/features/1item3.png", href: "/news-events" },
        { title: "Policy Formulation", image: "/features/1item4.png", href: "/news-events" },
      ],
    },
    {
      title: "Prepares the Provincial Development and Physical Framework Plan.",
      subtitle: "Framework Planning",
      icon: ToolCase,
      thumbnail: "/framework.jpg",
      items: [
        { title: "Land Use Plan", image: "/features/2item1.png", href: "/news-events" },
        { title: "Infrastructure Map", image: "/features/2item2.png", href: "/news-events" },
        { title: "Zoning Review", image: "/features/2item3.png", href: "/news-events" },
        { title: "Urban Expansion", image: "/features/2item4.png", href: "/news-events" },
      ],
    },
    {
      title: "Monitors and evaluates all provincial projects and programs.",
      subtitle: "Monitoring & Evaluation",
      icon: Activity,
      thumbnail: "/monitoring.jpg",
      items: [
        { title: "Project Evaluation", image: "/features/3item1.png", href: "/news-events" },
        { title: "Progress Reports", image: "/features/3item2.png", href: "/news-events" },
        { title: "Site Inspections", image: "/features/3item3.png", href: "/news-events" },
        { title: "Impact Assessment", image: "/features/3item4.png", href: "/news-events" },
      ],
    },
    {
      title: "Provides technical assistance to municipalities and cities in Tarlac.",
      subtitle: "Technical Assistance",
      icon: Handshake,
      thumbnail: "/assistance.jpg",
      items: [
        { title: "LGU Training", image: "/features/4item1.png", href: "/news-events" },
        { title: "Consultations", image: "/features/4item2.png", href: "/news-events" },
        { title: "Planning Support", image: "/features/4item3.png", href: "/news-events" },
        { title: "Capacity Building", image: "/features/4item4.png", href: "/news-events" },
      ],
    },
  ];

  return (
    <>
      {/* LANDING PAGE BOXES */}
      <section className="px-4 py-20 bg-[#f8f8f8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            const baseY = i === 0 || i === 3 ? -32 : 0;

            return (
              <motion.div
                key={i}
                initial={{ y: baseY }}
                whileHover={{ y: baseY - 8 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                onClick={() => setActiveFeature(feat)}
                className="
                  bg-white
                  border border-[#012130]/20
                  rounded-2xl
                  px-6 py-10
                  text-center
                  cursor-pointer
                  shadow-md
                  hover:shadow-xl
                  transition-all
                "
              >
                <Icon className="mx-auto mb-5 w-12 h-12 text-[#012130]" />
                <p
                  className="text-[#012130] text-sm leading-relaxed tracking-wide"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {feat.title}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {activeFeature && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveFeature(null)}
          >
            <motion.div
              className="
                bg-white
                w-full
                max-w-6xl
                rounded-2xl
                p-6 sm:p-8
                relative
                max-h-[90vh]
                flex
                flex-col
              "
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE */}
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
              >
                <X size={28} />
              </button>

              {/* HEADER (STAYS FIXED) */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#012130] mb-4">
                {activeFeature.subtitle}
              </h2>

              {/* SCROLLABLE CONTENT */}
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-4
                  gap-6
                  overflow-y-auto
                  pr-1
                  max-h-[60vh]
                  sm:max-h-full
                "
              >
                {activeFeature.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[#012130]">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
