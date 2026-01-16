import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f8f8f8] text-[#012130] text-sm" style={{ fontFamily: "var(--font-cinzel)" }}>
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* COLUMN 1 */}
          <div>
            <h4 className="font-bold uppercase mb-3">
              Republic of the Philippines
            </h4>

            <p className="mb-4">
              All content is in the public domain unless otherwise stated.
            </p>

            <p className="font-bold uppercase mb-1">
              Official Disclaimer:
            </p>
            <p className="mb-4">
              This website is maintained by the Provincial Government of
              Tarlac for informational purposes only.
            </p>

            <p className="font-bold mb-1">Accuracy:</p>
            <p className="mb-4">
              While we strive for accuracy, information may change without notice.
            </p>

            <p>
              <strong>Copyright:</strong> © 2024 Province of Tarlac.
              <br />
              All rights reserved.
            </p>
          </div>

          {/* COLUMN 2 */}
          <div>
            <h4 className="font-bold uppercase mb-3">
              About GOVPH
            </h4>

            <p className="mb-4">
              Learn more about the Philippine government, its structure,
              how government works and the people behind it.
            </p>

            <p className="font-bold mb-2">GOV.PH</p>
            <ul className="space-y-1">
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Open Data Portal
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Official Gazette
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 */}
          <div>
            <h4 className="font-bold uppercase mb-3">
              Government Links
            </h4>

            <ul className="space-y-1">
              {[
                "Office of the President",
                "Office of the Vice President",
                "Senate of the Philippines",
                "House of Representatives",
                "Supreme Court",
                "Court of Appeals",
                "Sandiganbayan",
              ].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-blue-600 hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 */}
          <div>
            <h4 className="font-bold uppercase mb-3">
              Legal Compliance
            </h4>

            <p className="font-bold mb-1">
              Transparency & Accountability
            </p>

            <ul className="space-y-1 mb-4">
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  FOI Manual
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Terms of Use
                </Link>
              </li>
            </ul>

            <p className="font-bold mb-1">
              Government Standards
            </p>
            <ul className="space-y-1">
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Anti-Red Tape Act Compliance
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 hover:underline">
                  Data Privacy Act Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-[#f8f8f8] mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © 2026 Provincial Government of Tarlac. All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link href="#" className="text-blue-600 hover:underline">
              Accessibility Statement
            </Link>
            <Link href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
