"use client";

import Image from "next/image";
import { useState } from "react";

const slides = [
  {
    name: "HON. CHRISTIAN YAP",
    title: "GOVERNOR",
    photo: "/Gov.png",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "VICE GOVERNOR",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
  {
    name: "HON. OFFICIAL NAME",
    title: "BOARD MEMBER",
    photo: "/placeholder.jpg",
  },
];


export default function Officials() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((current - 1 + slides.length) % slides.length);

  const next = () =>
    setCurrent((current + 1) % slides.length);

  return (
    <section className="relative bg-[#f8f8f8] py-28" style={{ fontFamily: "var(--font-cinzel)" }}>

      {/* Decorative background */}
      <Image
        src="/bg.png"
        alt="Background"
        width={1920}
        height={300}
        className="absolute bottom-0 left-0 w-full object-cover"
      />

      <div className="relative max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-4xl md:text-5xl font-bold text-[#012130] mb-12">
          Province of Tarlac Officials
        </h2>

        <div className="bg-white rounded-3xl max-w-[620px] mx-auto shadow-lg px-10 py-10 min-h-[380px] relative">

          {/* Left */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2
                       bg-[#d7f6dc] w-12 h-12 rounded-full text-xl font-bold"
          >
            ‹
          </button>

          {/* Right */}
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       bg-[#d7f6dc] w-12 h-12 rounded-full text-xl font-bold"
          >
            ›
          </button>

          {/* Photo */}
          <div className="flex justify-center mb-">
            <div className="relative w-92 h-92 rounded-full bg-white flex items-center justify-center">

              {/* Seal */}
              <Image
                src="/capitol-logo.png"
                alt="Seal"
                width={580}
                height={580}
                className="absolute opacity-50"
              />

              {/* Official */}
              <Image
                src={slides[current].photo}
                alt={slides[current].name}
                width={345}
                height={345}
                className="relative z-10 rounded-full object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Name */}
          <div className="inline-block bg-[#d7f6dc] border border-[#012130] px-8">
            <p className="font-bold text-[#012130]">
              {slides[current].name}
            </p>
            <p className="text-sm text-[#012130]">
              {slides[current].title}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === current ? "bg-black" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
