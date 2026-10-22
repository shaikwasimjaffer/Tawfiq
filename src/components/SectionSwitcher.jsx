import React from "react";

export default function SectionSwitcher({ tabs = [], active, onChange }) {
  return (
    <div className="flex items-center p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl">
      {tabs.map((tab) => {
        const id = typeof tab === "string" ? tab : tab.id;
        const label = typeof tab === "string" ? tab : tab.label;
        const isActive = active === id;

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${isActive
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
