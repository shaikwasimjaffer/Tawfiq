import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, BookOpen, Calculator, GraduationCap } from "lucide-react";

/**
 * Premium Mobile Bottom Navigation
 * - Floating pill container with refined 38px radius and subtle warm border (#E7E2D9).
 * - Separators removed completely in favor of balanced, minimal whitespace.
 * - Four permanently fixed, equal-width navigation slots: Prayers, Quran, Qaza, Learn.
 * - (Mentor is accessible via the top segmented control).
 * - Independent sliding green active indicator (#244A3A) with 350ms ease-out animation.
 * - Standardized 12px typography with regular weight for inactive, medium weight for active.
 */
const NAV_ITEMS = [
  {
    id: "prayers",
    label: "Salah",
    path: "/",
    icon: Clock,
  },
  {
    id: "quran",
    label: "Quran",
    path: "/quran",
    icon: BookOpen,
  },
  {
    id: "qaza",
    label: "Qaza",
    path: "/qaza",
    icon: Calculator,
  },
  {
    id: "learn",
    label: "Learn",
    path: "/learn",
    icon: GraduationCap,
  },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const containerRef = React.useRef(null);
  const itemsRef = React.useRef([]);
  const [optimisticIndex, setOptimisticIndex] = React.useState(null);

  // Clear optimistic index once path updates
  React.useEffect(() => {
    setOptimisticIndex(null);
  }, [currentPath]);

  // Resolve active index (0 to 3) based on current route; -1 when on non-bottom-nav pages like /mentor
  const routeIndex = React.useMemo(() => {
    if (currentPath === "/" || currentPath.startsWith("/prayers")) {
      return 0;
    }
    if (currentPath.startsWith("/quran")) {
      return 1;
    }
    if (currentPath.startsWith("/qaza")) {
      return 2;
    }
    if (currentPath.startsWith("/learn")) {
      return 3;
    }
    return -1;
  }, [currentPath]);

  const activeIndex = optimisticIndex !== null ? optimisticIndex : routeIndex;

  // Measured indicator geometry state (left offset and width in px)
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Measure active item position relative to container
  const updateIndicatorPosition = React.useCallback(() => {
    const container = containerRef.current;
    if (!container || activeIndex === -1) {
      setIndicatorStyle((prev) => ({
        ...prev,
        opacity: 0,
      }));
      return;
    }

    const activeItem = itemsRef.current[activeIndex];
    if (!activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const left = itemRect.left - containerRect.left;
    const width = itemRect.width;

    setIndicatorStyle({
      left,
      width,
      opacity: 1,
    });
  }, [activeIndex]);

  // Measure on activeIndex change and mount
  React.useLayoutEffect(() => {
    updateIndicatorPosition();
  }, [updateIndicatorPosition]);

  // Measure on window and container resize
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      updateIndicatorPosition();
    };

    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [updateIndicatorPosition]);

  const handleItemClick = (index, isActive) => {
    if (isActive) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setOptimisticIndex(index);
  };

  return (
    <div
      role="region"
      aria-label="Navigation Wrapper"
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none flex justify-center pb-3"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
      }}
    >
      {/* Shell Container: Constrained to application content width */}
      <div className="w-full max-w-md px-4 pointer-events-none box-border">
        {/* Navigation Surface: 38px rounded outer container, warm ivory, thin #E7E2D9 border */}
        <nav
          role="navigation"
          aria-label="Main Navigation"
          className="pointer-events-auto w-full h-[64px] bg-[#FFFEFB] dark:bg-[#161C19] border border-[#E7E2D9] dark:border-stone-800 rounded-[38px] p-1.5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] relative box-border"
        >
          {/* Inner Flex Row */}
          <div
            ref={containerRef}
            className="relative w-full h-full flex items-center box-border"
          >
            {/* Sliding Subdued Green Indicator (300ms cubic-bezier(0.32, 1.15, 0.52, 1) subtle spring finish) */}
            <div
              aria-hidden="true"
              className="bottom-nav-indicator absolute top-0 bottom-0 left-0 h-full rounded-[32px] bg-[#244A3A] dark:bg-[#1D3D30] pointer-events-none z-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] will-change-transform motion-reduce:transition-none"
              style={{
                width: indicatorStyle.width > 0 ? `${indicatorStyle.width}px` : "25%",
                transform: `translateX(${indicatorStyle.left}px)`,
                opacity: indicatorStyle.opacity,
                transition:
                  "transform 300ms cubic-bezier(0.32, 1.15, 0.52, 1), width 300ms cubic-bezier(0.32, 1.15, 0.52, 1), opacity 150ms ease-out",
              }}
            />

            {/* Four Stationary Navigation Items */}
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeIndex === index;

              return (
                <Link
                  key={item.id}
                  ref={(el) => (itemsRef.current[index] = el)}
                  to={item.path}
                  onClick={() => handleItemClick(index, isActive)}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className="flex-1 min-w-0 h-full flex flex-col items-center justify-center relative z-20 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244A3A] rounded-[30px] box-border px-1 active:scale-[0.93] transition-all duration-150"
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-[#FFFFFF]"
                        : "text-[#77766F] group-hover:text-[#4A4944] dark:text-stone-400 dark:group-hover:text-stone-200"
                    }`}
                  />
                  <span
                    className={`text-[12px] tracking-tight mt-1 leading-none transition-colors duration-200 truncate max-w-full text-center px-0.5 ${
                      isActive
                        ? "font-medium text-[#FFFFFF]"
                        : "font-normal text-[#77766F] group-hover:text-[#4A4944] dark:text-stone-400 dark:group-hover:text-stone-200"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
