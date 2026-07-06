import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export type SearchableOption = {
  value: string;
  label: string;
  sublabel?: string;
  /** Extra text used for matching (part no., code, etc.) */
  searchText?: string;
};

type Props = {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
};

/** Match by typing first 2–3 words of item name or part number */
export function filterByStartingWords(
  options: SearchableOption[],
  query: string
): SearchableOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  const words = q.split(/\s+/).filter(Boolean).slice(0, 5);

  return options.filter(opt => {
    const haystack = `${opt.label} ${opt.sublabel ?? ''} ${opt.searchText ?? ''}`.toLowerCase();
    const tokens = haystack.split(/[\s\-_/]+/).filter(Boolean);

    return words.every((word, idx) => {
      if (idx === 0) {
        return tokens.some(t => t.startsWith(word)) || haystack.includes(word);
      }
      return haystack.includes(word);
    });
  });
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Type 2–3 letters to search…',
  emptyMessage = 'No items match your search',
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = useMemo(
    () => filterByStartingWords(options, query).slice(0, 50),
    [options, query]
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (val: string) => {
    onChange(val);
    const opt = options.find(o => o.value === val);
    setQuery(opt ? `${opt.label}` : '');
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          disabled={disabled}
          value={open ? query : (selected ? `${selected.label}${selected.sublabel ? ` (${selected.sublabel})` : ''}` : query)}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => {
            setOpen(true);
            if (selected) setQuery(selected.label);
          }}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border bg-popover shadow-md">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">{emptyMessage}</p>
          ) : (
            filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/80 border-b last:border-0 ${
                  opt.value === value ? 'bg-muted/50 font-medium' : ''
                }`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(opt.value)}
              >
                <span className="block font-medium">{opt.label}</span>
                {opt.sublabel && (
                  <span className="block text-xs text-muted-foreground mt-0.5">{opt.sublabel}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
