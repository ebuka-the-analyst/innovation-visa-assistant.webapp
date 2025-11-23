import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ALL_TOOLS } from "@shared/tools-data";
import * as Icons from "lucide-react";
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

type IconName = keyof typeof Icons;

export default function ToolsChronographWheel() {
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isMouseOverWidgetRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const [selectedToolIdx, setSelectedToolIdx] = useState(0); // Start at tool 001
  const [isMinimized, setIsMinimized] = useState(true);
  const [isHoveringUp, setIsHoveringUp] = useState(false);
  const [isHoveringDown, setIsHoveringDown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isHoveringWidget, setIsHoveringWidget] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chevronScrollRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const checkInactivityRef = useRef<NodeJS.Timeout | null>(null);
  const blockMouseScrollRef = useRef<boolean>(false);
  const blockScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tools = ALL_TOOLS;
  const selectedTool = tools[selectedToolIdx];

  // Record user activity
  const recordActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Prevent body scroll when widget is open - using body-scroll-lock library
  useEffect(() => {
    const scrollElement = scrollRef.current;
    
    if (!isMinimized && scrollElement) {
      // Enable widget scroll while disabling body scroll
      disableBodyScroll(scrollElement, {
        reserveScrollBarGap: true,
      });
      
      return () => {
        enableBodyScroll(scrollElement);
      };
    }
    
    return () => {
      if (scrollElement) {
        enableBodyScroll(scrollElement);
      }
    };
  }, [isMinimized]);

  const GetIconComponent = ({ name }: { name: string }) => {
    const Icon = Icons[name as IconName] as any;
    return Icon ? <Icon className="w-8 h-8" /> : <Icons.Zap className="w-8 h-8" />;
  };

  const tierColors = {
    free: "bg-green-50 border-green-200 text-green-700",
    basic: "bg-blue-50 border-blue-200 text-blue-700",
    premium: "bg-purple-50 border-purple-200 text-purple-700",
    enterprise: "bg-red-50 border-red-200 text-red-700",
    ultimate: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  // Handle scroll and update selected tool based on center position
  const handleScroll = () => {
    recordActivity();
    if (!scrollRef.current) return;
    
    // Clamp scroll position - prevent scrolling above tool 001 (scrollTop = 0)
    if (scrollRef.current.scrollTop < 0) {
      scrollRef.current.scrollTop = 0;
    }
    
    const scrollTop = scrollRef.current.scrollTop;
    const containerHeight = scrollRef.current.clientHeight;
    // Item height is ~48px (44px item + 4px spacing from space-y-1)
    const itemHeight = 48;
    // Calculate which tool is at the center, accounting for first tool starting at 0
    const newSelectedIdx = Math.round(scrollTop / itemHeight);
    
    if (newSelectedIdx >= 0 && newSelectedIdx < tools.length && newSelectedIdx !== selectedToolIdx) {
      setSelectedToolIdx(newSelectedIdx);
    }
  };

  // Handle mouse move to scroll
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    recordActivity();
    if (!scrollRef.current) return;

    // Skip scrolling if it's blocked (right after widget opens)
    if (blockMouseScrollRef.current) {
      return;
    }

    const containerRect = scrollRef.current.getBoundingClientRect();
    const mouseY = e.clientY - containerRect.top;
    const containerHeight = containerRect.height;
    const centerY = containerHeight / 2;
    const threshold = 30; // Distance from center to trigger scroll

    const distance = Math.abs(mouseY - centerY);
    const isAboveCenter = mouseY < centerY;
    const isBelowCenter = mouseY > centerY;

    // Clear existing interval
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    if (distance < threshold) {
      // Don't scroll if near center
      return;
    }

    // Calculate scroll speed based on distance
    const speedFactor = (distance - threshold) / (containerHeight / 2 - threshold);
    const scrollSpeed = speedFactor * 10; // Max 10px per interval (50% of original)

    // Start continuous scrolling
    scrollIntervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        const newScrollTop = scrollRef.current.scrollTop + (isAboveCenter ? -scrollSpeed : scrollSpeed);
        scrollRef.current.scrollTop = Math.max(0, Math.min(newScrollTop, scrollRef.current.scrollHeight - scrollRef.current.clientHeight));
      }
    }, 16);
  };

  const handleMouseLeave = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // Setup native wheel event listener with passive: false for proper preventDefault
  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (!isMouseOverWidgetRef.current || !scrollRef.current || blockMouseScrollRef.current) return;

      recordActivity();
      e.preventDefault();
      const scrollDelta = e.deltaY > 0 ? 15 : -15; // 50% of original speed
      scrollRef.current.scrollTop = Math.max(
        0,
        Math.min(
          scrollRef.current.scrollTop + scrollDelta,
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight
        )
      );
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  // Handle touch swipe to dismiss
  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchStartXRef.current - touchEndX;
      const deltaY = Math.abs(touchStartYRef.current - touchEndY);
      
      // Swipe left detected (min 50px horizontal, less vertical movement)
      if (deltaX > 50 && deltaY < 30) {
        setIsDismissed(true);
        setShowSwipeHint(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Swipe hint continues indefinitely - no timeout

  // Reset scroll to show tool 001 when widget opens and block mouse scrolling briefly
  useEffect(() => {
    if (!isMinimized && scrollRef.current) {
      // Set selected tool to 001 (index 0)
      setSelectedToolIdx(0);
      
      // Scroll to top - tool 001 is the first item
      scrollRef.current.scrollTop = 0;
      
      // Block mouse scrolling for 100ms to prevent auto-scroll on open
      blockMouseScrollRef.current = true;
      
      // Clear any existing timer
      if (blockScrollTimerRef.current) {
        clearTimeout(blockScrollTimerRef.current);
      }
      
      // Re-enable mouse scrolling after 100ms
      blockScrollTimerRef.current = setTimeout(() => {
        blockMouseScrollRef.current = false;
      }, 100);
    }
    
    return () => {
      if (blockScrollTimerRef.current) {
        clearTimeout(blockScrollTimerRef.current);
      }
    };
  }, [isMinimized]);

  // Inactivity timer - minimize widget after 10 seconds when mouse leaves and user scrolls main page
  useEffect(() => {
    if (isMinimized) {
      // Clear timer if widget is minimized
      if (checkInactivityRef.current) {
        clearInterval(checkInactivityRef.current);
      }
      return;
    }

    // Only set up timer if mouse is NOT hovering over widget
    if (isHoveringWidget) {
      // Clear timer if hovering
      if (checkInactivityRef.current) {
        clearInterval(checkInactivityRef.current);
      }
      return;
    }

    // Start activity check when widget is opened AND mouse has left
    recordActivity();
    
    checkInactivityRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Minimize widget if 10 seconds of inactivity (mouse away from widget)
      if (timeSinceLastActivity > 10000 && !isMouseOverWidgetRef.current) {
        setIsMinimized(true);
      }
    }, 500); // Check every 500ms

    return () => {
      if (checkInactivityRef.current) {
        clearInterval(checkInactivityRef.current);
      }
    };
  }, [isMinimized, isHoveringWidget]);

  // Handle quick scroll on chevron hover (blocked during grace period, clamped at 0)
  useEffect(() => {
    if (isHoveringUp && scrollRef.current && !blockMouseScrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, scrollRef.current.scrollTop - 7.5);
      // Ensure we don't go below 0
      if (scrollRef.current.scrollTop < 0) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [isHoveringUp]);

  useEffect(() => {
    if (isHoveringDown && scrollRef.current && !blockMouseScrollRef.current) {
      scrollRef.current.scrollTop = Math.min(
        scrollRef.current.scrollHeight - scrollRef.current.clientHeight,
        scrollRef.current.scrollTop + 7.5
      );
    }
  }, [isHoveringDown]);

  // Setup continuous scroll on hover (blocked during grace period)
  useEffect(() => {
    if (!isHoveringUp || blockMouseScrollRef.current) {
      if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);
      return;
    }

    if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);

    chevronScrollRef.current = setInterval(() => {
      if (scrollRef.current && !blockMouseScrollRef.current) {
        const newScrollTop = Math.max(0, scrollRef.current.scrollTop - 6); // 50% of original
        scrollRef.current.scrollTop = newScrollTop;
      }
    }, 50);

    return () => {
      if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);
    };
  }, [isHoveringUp]);

  useEffect(() => {
    if (!isHoveringDown || blockMouseScrollRef.current) {
      if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);
      return;
    }

    if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);

    chevronScrollRef.current = setInterval(() => {
      if (scrollRef.current && !blockMouseScrollRef.current) {
        scrollRef.current.scrollTop = Math.min(
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight,
          scrollRef.current.scrollTop + 6 // 50% of original
        );
      }
    }, 50);

    return () => {
      if (chevronScrollRef.current) clearInterval(chevronScrollRef.current);
    };
  }, [isHoveringDown]);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-8 left-8 z-40"
      data-testid="chronograph-wheel-container"
      style={{ 
        scale: window.innerWidth < 768 ? "0.55" : window.innerWidth < 1024 ? "0.45" : window.innerWidth < 1440 ? "0.55" : "0.65",
        transformOrigin: "bottom left",
        animation: "widget-swipe-pulse 8s ease-in-out infinite"
      }}
      onMouseEnter={() => {
        isMouseOverWidgetRef.current = true;
        setIsHoveringWidget(true);
        recordActivity();
      }}
      onMouseLeave={() => {
        isMouseOverWidgetRef.current = false;
        setIsHoveringWidget(false);
      }}
    >
      {/* Expand/Collapse Indicator */}
      <div className="absolute -top-32 left-0 right-0 flex items-center justify-center">
        <button
          onClick={() => {
            recordActivity();
            setIsMinimized(!isMinimized);
          }}
          className="font-black text-center px-4 py-2 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
          data-testid="button-toggle-indicator"
          aria-label={isMinimized ? "Expand Tools Hub" : "Minimize Tools Hub"}
          style={{ 
            color: "#ffffff", 
            backgroundColor: isMinimized ? "#11b6e9" : "#e63946",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)", 
            lineHeight: "1",
            boxShadow: "none",
            border: "none"
          }}
        >
          {isMinimized ? "+" : "−"}
        </button>
      </div>

      {/* Text Label Above Widget */}
      {isMinimized && (
        <div className="absolute -top-16 left-0 right-0 flex items-center justify-center">
          <button
            onClick={() => {
              recordActivity();
              setIsMinimized(false);
            }}
            className="font-black text-center pulse-glow-orange px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
            data-testid="button-toggle-text-label"
            aria-label="Expand Tools Hub"
            style={{ 
              color: "#000000", 
              backgroundColor: "#ffa536",
              fontSize: "clamp(0.8rem, 2vw, 1.5rem)", 
              lineHeight: "1.2",
              border: "none",
              boxShadow: "none"
            }}
          >
            100+<br/>Tools-Hub
          </button>
        </div>
      )}

      {/* Outer metal bezel effect - Transparent like chat icon */}
      <div 
        className="relative flex flex-col cursor-pointer" 
        style={{ 
          height: isMinimized ? "0" : "640px", 
          width: isMinimized ? "0" : "480px", 
          borderRadius: isMinimized ? "0" : "1rem",
          transition: "all 0.3s ease",
          backgroundColor: isMinimized ? "transparent" : "rgba(255, 255, 255, 0.05)",
          borderColor: isMinimized ? "transparent" : "rgba(156, 163, 175, 0.1)",
          borderWidth: isMinimized ? "0" : "4px",
          borderStyle: "solid",
          boxShadow: isMinimized ? "none" : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          backdropFilter: isMinimized ? "none" : "blur(12px)",
          WebkitBackdropFilter: isMinimized ? "none" : "blur(12px)",
          opacity: isMinimized ? "0" : "1",
          pointerEvents: isMinimized ? "none" : "auto"
        }}
        onClick={() => {
          if (!isMinimized) return; // Only toggle if minimized
          recordActivity();
          setIsMinimized(!isMinimized);
        }}
      >
        
        {/* Static Header Section - "100+ TOOLS HUB" - Only when expanded */}
        {!isMinimized && (
          <div className="flex flex-col items-center justify-center gap-2 px-3 border-b-2 border-gray-400 pulse-glow-orange" style={{ 
            backgroundColor: "#ffa536",
            borderRadius: "0.5rem 0.5rem 0 0",
            borderBottom: "2px solid rgb(107, 114, 128)",
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <h3 className="font-black text-center whitespace-nowrap" style={{ color: "#000000", fontSize: "clamp(0.8rem, 2vw, 1.5rem)", lineHeight: "1.2" }}>100+ TOOLS-HUB</h3>
          </div>
        )}

        {/* Floating Close/Open Button - Always top right */}
        <button
          onClick={() => {
            recordActivity();
            setIsMinimized(!isMinimized);
          }}
          className="absolute top-2 right-2 flex-shrink-0 hover:opacity-80 transition-opacity z-50 flex items-center gap-4 px-6 py-3 rounded-full font-bold text-xl"
          data-testid="button-toggle-tools-hub"
          aria-label={isMinimized ? "Expand Tools Hub" : "Minimize Tools Hub"}
          style={{ 
            backgroundColor: isMinimized ? "#11b6e9" : "#e63946",
            color: "#ffffff",
            scale: "0.7",
            transformOrigin: "top right",
            boxShadow: "none",
            filter: "none",
            border: "none",
            outline: "none"
          }}
        >
          {isMinimized ? (
            <>
              <Icons.ChevronUp className="w-8 h-8" />
              <span style={{ fontSize: "clamp(0.8rem, 2vw, 1.5rem)" }}>Open</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "clamp(0.8rem, 2vw, 1.5rem)" }}>Close</span>
              <Icons.X className="w-8 h-8" />
            </>
          )}
        </button>


        {/* Static Section Header - "APPLICATION REQUIREMENT CHECKS" - Hidden when minimized */}
        {!isMinimized && (
          <div className="px-3 py-2 border-b-2 border-gray-400" style={{ backgroundColor: "#ffa536" }}>
            <p className="font-black tracking-wide" style={{ color: "#000000", fontSize: "clamp(0.8rem, 2vw, 1.5rem)", lineHeight: "1.2" }}>APPLICATION REQUIREMENT CHECKS</p>
          </div>
        )}

        {/* Main Container with Featured Tool in Center - Hidden when minimized */}
        {!isMinimized && (
        <div className="flex-1 relative overflow-hidden">
          {/* Scrollable tool list background */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-scroll overflow-x-hidden px-2 sm:px-3 py-2 sm:py-3"
            onScroll={handleScroll}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onWheel={(e) => {
              // Prevent page scroll when scrolling inside widget
              e.stopPropagation();
              const element = scrollRef.current;
              if (element) {
                const isAtTop = element.scrollTop === 0;
                const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
                
                // Only prevent default if we're not at the boundaries
                if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
                  e.preventDefault();
                }
              }
            }}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 165, 54, 0.5) rgba(0, 0, 0, 0.1)",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              userSelect: "none"
            }}
          >
            <div className="space-y-1 sm:space-y-2">
              {tools.map((tool, idx) => (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolIdx(idx)}
                  className={`flex items-start gap-1 sm:gap-2 p-1 sm:p-2 rounded-md cursor-pointer transition-all border ${
                    idx === selectedToolIdx
                      ? "bg-primary/20 border-primary font-bold"
                      : "hover:bg-gray-100 border-transparent hover:border-gray-300"
                  }`}
                  data-testid={`tool-${idx}`}
                >
                  {/* Number */}
                  <div className={`text-xs font-bold w-6 sm:w-8 flex-shrink-0 pt-0.5 ${
                    idx === selectedToolIdx ? "text-primary" : "text-gray-500"
                  }`}>
                    {String(idx + 1).padStart(3, "0")}
                  </div>

                  {/* Tool info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${
                      idx === selectedToolIdx ? "font-black text-black" : "font-semibold text-black"
                    }`}>
                      {tool.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate line-clamp-1">
                      {tool.description}
                    </p>
                  </div>

                  {/* Tier badge */}
                  <div className={`flex-shrink-0 text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded border ${tierColors[tool.tier as keyof typeof tierColors]}`}>
                    {tool.tier.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
              {/* Bottom spacer to prevent fade mask from hiding last tools */}
              <div style={{ height: "80px" }} />
            </div>
          </div>

          {/* Fade masks - top and bottom - Interactive */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
            style={{
              height: "80px",
              background: "linear-gradient(to bottom, rgba(240,244,248,1) 0%, rgba(240,244,248,0) 100%)",
            }}
            onMouseEnter={() => setIsHoveringUp(true)}
            onMouseLeave={() => setIsHoveringUp(false)}
          >
            <Icons.ChevronUp className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 ${isHoveringUp ? "" : "animate-bounce"}`} style={{ animationDelay: "0s" }} />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
            style={{
              height: "80px",
              background: "linear-gradient(to top, rgba(240,244,248,1) 0%, rgba(240,244,248,0) 100%)",
            }}
            onMouseEnter={() => setIsHoveringDown(true)}
            onMouseLeave={() => setIsHoveringDown(false)}
          >
            <Icons.ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 ${isHoveringDown ? "" : "animate-bounce"}`} style={{ animationDelay: "0.2s" }} />
          </div>

          {/* Featured Tool Box - Centered Behind */}
          <div 
            className="absolute inset-0 flex items-center justify-center px-0.5 sm:px-1 z-5"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <a 
              href={`/tools/${selectedTool.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-3 bg-white border-2 border-gray-300 rounded-lg w-full cursor-pointer hover:shadow-lg transition-shadow block" 
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
            >
              <div className="flex flex-col gap-1 sm:gap-2">
                <p className="text-sm sm:text-base md:text-2xl text-black font-black">
                  {String(selectedToolIdx + 1).padStart(3, "0")}
                </p>
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-black leading-tight w-full">
                  {selectedTool.name.toUpperCase()}
                </h2>
                <p className="text-xs sm:text-sm md:text-lg text-black font-black w-full line-clamp-2">
                  {selectedTool.description.toUpperCase()}
                </p>
                <div className="flex justify-center pt-1 sm:pt-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full border-2 border-gray-400 flex items-center justify-center bg-gray-50 text-gray-600">
                    <GetIconComponent name={selectedTool.icon} />
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
        )}

        {/* Stainless steel cover effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(200,200,200,0.1))",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2) inset",
          }}
        />
      </div>
    </div>
  );
}
