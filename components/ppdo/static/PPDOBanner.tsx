"use client";

export default function PPDOBanner() {
  return (
    <section className="text-center py-14 px-6 bg-[#f8f8f8]">

      <p className="uppercase text-sm tracking-[0.3em] text-gray-700 mb-4"
      style={{ fontFamily: "var(--font-cinzel)" }}
      >
        Official Portal
      </p>

      <h1 className="text-5xl md:text-6xl font-semibold mt-4 text-[#0c3823] leading-tight font-[var(--font-cinzel)]"
      style={{ fontFamily: "var(--font-cinzel)" }}
      >
  Provincial Planning and <br />
  Development Office
</h1>


      <button className="cursor-pointer mt-5 px-8 py-2 font-semibold bg-white border border-gray-500 rounded-full shadow-sm hover:bg-gray-100 transition uppercase"
      style={{ fontFamily: "var(--font-cinzel)" }}
      >
        View more
      </button>

    </section>
  );
}
