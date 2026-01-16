"use client";

import Image from "next/image";

export default function GovernorMessage() {
  return (
    <section className="w-full bg-[#f8f8f8] pt-24 pb-16">

      <div className="max-w-7xl mx-auto px-6">

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* LEFT: GOVERNOR IMAGE */}
          <div className="flex flex-col items-center">
            <div className="bg-white shadow-lg p-">
              <Image
                src="/Gov.png" // <-- replace with your image path
                alt="Provincial Governor"
                width={420}
                height={520}
                className="object-cover"
                priority
              />
            </div>

            <div className="mt-6 text-center text-#012130">
              <p className="font-extrabold tracking-wide"
              style={{ fontFamily: "var(--font-cinzel)" }}>
                Provincial Governor
              </p>
              <p className="font-bold text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>
                Province of Tarlac</p>
            </div>
          </div>

          {/* RIGHT: MESSAGE */}
          <div className="text-#012130 relative text-center flex flex-col items-center">


            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Office of the Governor <br />
              Message from the Governor
            </h2>

            <p className="mb-4 leading-relaxed" style={{ fontFamily: "var(--font-cinzel)" }}>
              Welcome to the official portal of the Provincial Government of
              Tarlac. This platform is dedicated to transparent and efficient
              public service—bringing vital information, services, and
              opportunities closer to our communities across the province.
            </p>

            <p className="mb-4 leading-relaxed" style={{ fontFamily: "var(--font-cinzel)" }}>
              As we continue to modernize public service delivery, our priority
              remains the well-being of every Tarlaqueño. We invite you to
              explore our programs, engage with our offices, and take part in
              building a more inclusive and progressive Tarlac.
            </p>

            <p className="italic mt-6" style={{ fontFamily: "times new roman" }}>
              Maraming salamat at mabuhay ang Lalawigan ng Tarlac.
            </p>

            <p className="mt-10 text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>
              Signed, <br />
              <span className="font-semibold" style={{ fontFamily: "var(--font-cinzel)" }}>Office of the Governor</span>
            </p>

            {/* OPTIONAL WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Image
                src="/logo.png"
                alt="Official Seal"
                width={400}
                height={400}
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
