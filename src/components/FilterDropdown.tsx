import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type FilterDropdownProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function FilterDropdown({ value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="filter-dropdown" ref={wrapperRef}>
      <button
        type="button"
        className="filter-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{value}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="filter-dropdown-menu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-dropdown-option ${option === value ? "active" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}