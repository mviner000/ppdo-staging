"use client";

import Image from "next/image";

const events = [
  {
    title: "Monitoring and Evaluation of Government Development Programs",
    image: "/news-events/Monitoring and Evaluation of Government Development Programs.png",
  },
  {
    title: "Investment Promotion and Local Economic Development Support",
    image: "/news-events/Investment Promotion and Local Economic Development Support.png",
  },
  {
    title: "Program Performance Review and Impact Assessment",
    image: "/news-events/Program Performance Review and Impact Assessment.png",
  },
];

const news = [
  {
    title: "Monitoring and Evaluation of Government Development Programs",
    image: "/news-events/Monitoring and Evaluation of Government Development Programs.png",
  },
  {
    title: "Investment Promotion and Local Economic Development Support",
    image: "/news-events/Investment Promotion and Local Economic Development Support.png",
  },
  {
    title: "Program Performance Review and Impact Assessment",
    image: "/news-events/Program Performance Review and Impact Assessment.png",
  },
  {
    title: "Government Project Monitoring and Compliance Review",
    image: "/news-events/Government Project Monitoring and Compliance Review.png",
  },
  {
    title: "Investment Facilitation and Business Development Initiatives",
    image: "/news-events/Investment Facilitation and Business Development Initiatives.png",
  },
  {
    title: "Research, Data Analysis, and Statistical Reporting",
    image: "/news-events/Research, Data Analysis, and Statistical Reporting.png",
  },
  {
    title: "Inter-Agency Planning and Coordination Workshop",
    image: "/news-events/Inter-Agency Planning and Coordination Workshop.png",
  },
  {
    title: "Policy Implementation Monitoring and Evaluation Session",
    image: "/news-events/Policy Implementation Monitoring and Evaluation Session.png",
  },
  {
    title: "Public–Private Investment Engagement and Promotion",
    image: "/news-events/Public–Private Investment Engagement and Promotion.png",
  },
  {
    title: "Development Program Review and Strategic Assessment",
    image: "/news-events/Development Program Review and Strategic Assessment.png",
  },
  {
    title: "Economic Development Planning and Investment Support",
    image: "/news-events/Economic Development Planning and Investment Support.png",
  },
];

export default function PPDOActivities() {
  return (
    <section
      className="bg-[#f8f8f8] py-20"
      style={{ fontFamily: "var(--font-cinzel)" }}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="bg-[#f8f8f8] p-6 rounded-xl">
          <h3 className="text-lg font-bold text-[#012130] mb-6">
            PPDO News
          </h3>

          <div className="flex flex-col gap-5">
            {news.slice(2).map((item, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={80}
                  height={60}
                  className="rounded-md object-cover"
                />
                <p className="text-sm text-[#012130]">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER FEATURED */}
        <div className="bg-[#f8f8f8] p-6 rounded-xl text-center">
          <Image
            src="/placeholder.jpg"
            alt="Featured Activity"
            width={500}
            height={300}
            className="rounded-xl mx-auto mb-6 object-cover"
          />
          <h2 className="text-4xl font-semibold text-[#012130]">
            Provincial Planning and Development Office
          </h2>
          <p className="text-2xl font-semibold text-[#012130]">
            News and Events
          </p>
        </div>

        {/* RIGHT COLUMN – EVENTS (FIXED IMAGE FIT) */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-[#012130] mb-6">
            PPDO Events
          </h3>

          {events.map((item, i) => (
            <div key={i} className="bg-[#f8f8f8] p-4 rounded-xl">
              {/* IMAGE PLACEHOLDER */}
              <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-white">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>

              {/* TITLE */}
              <p className="text-sm text-[#012130] font-medium mt-3">
                {item.title}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
