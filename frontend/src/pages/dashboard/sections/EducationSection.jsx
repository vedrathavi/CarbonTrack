import React, { useEffect, useRef } from "react";

export default function EducationSection() {
  const containerRef = useRef();

  useEffect(() => {
    const onScrollTo = (e) => {
      const { sub } = e.detail || {};
      if (!sub) return;
      const el = document.getElementById(sub);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("scroll-to", onScrollTo);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            window.dispatchEvent(
              new CustomEvent("active-sub", {
                detail: { section: "education", sub: id },
              })
            );
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    const subs = Array.from(document.querySelectorAll("#education [id^=sub-]"));
    subs.forEach((s) => observer.observe(s));

    return () => {
      window.removeEventListener("scroll-to", onScrollTo);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      id="education"
      ref={containerRef}
      className="space-y-8 overflow-auto"
    >
      {[1, 2, 3].map((i) => (
        <section key={i} id={`sub-${i}`} className="p-6 bg-gray-50 rounded">
          <h3 className="text-xl font-semibold mb-2">
            Education — Sub-option {i}
          </h3>
          <p className="text-gray-600">
            Placeholder content for education sub-section {i}. Edit this file to
            add articles or resources.
          </p>
          <div className="mt-4 h-40 bg-white border rounded" />
        </section>
      ))}
    </div>
  );
}
