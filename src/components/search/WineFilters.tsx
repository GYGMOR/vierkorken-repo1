'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface WineFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  search?: string;
  wineTypes?: string[];
  countries?: string[];
  regions?: string[];
  grapeVarieties?: string[];
  priceRange?: { min: number; max: number };
  vintageRange?: { min: number; max: number };

  // Sommelier Mode - Geschmackssuche
  body?: number; // 1-10
  acidity?: number; // 1-10
  tannin?: number; // 1-10
  sweetness?: number; // 1-10 (10 = trocken)

  certifications?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'rating' | 'newest';
}

export function WineFilters({ onFilterChange, className }: WineFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sommelierMode, setSommelierMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleArrayFilterToggle = (key: keyof FilterState, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange?.({});
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/40" />
        <Input
          type="text"
          placeholder="Wein, Weingut oder Region suchen..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSommelierMode(!sommelierMode)}
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors text-sm font-medium',
            sommelierMode
              ? 'bg-accent-burgundy text-warmwhite border-accent-burgundy'
              : 'bg-warmwhite text-graphite border-taupe hover:border-graphite'
          )}
        >
          <FlaskIcon className="w-4 h-4 inline mr-2" />
          Geschmackssuche
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 rounded-lg border border-taupe bg-warmwhite text-graphite hover:border-graphite transition-colors text-sm font-medium"
        >
          <FilterIcon className="w-4 h-4 inline mr-2" />
          {isExpanded ? 'Weniger Filter' : 'Mehr Filter'}
        </button>

        {Object.keys(filters).length > 0 && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg text-sm font-medium text-graphite/60 hover:text-graphite-dark transition-colors"
          >
            Alle Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Sommelier Mode - Geschmackssuche */}
      {sommelierMode && (
        <div className="p-6 bg-warmwhite-light rounded-xl border border-taupe-light space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskIcon className="w-5 h-5 text-accent-burgundy" />
            <h3 className="font-serif text-h4 text-graphite-dark">Geschmackssuche</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <SliderFilter
              label="Körper"
              min={1}
              max={10}
              value={filters.body || 5}
              onChange={(value) => handleFilterChange('body', value)}
              leftLabel="Leicht"
              rightLabel="Voll"
            />
            <SliderFilter
              label="Säure"
              min={1}
              max={10}
              value={filters.acidity || 5}
              onChange={(value) => handleFilterChange('acidity', value)}
              leftLabel="Mild"
              rightLabel="Lebhaft"
            />
            <SliderFilter
              label="Tannin"
              min={1}
              max={10}
              value={filters.tannin || 5}
              onChange={(value) => handleFilterChange('tannin', value)}
              leftLabel="Weich"
              rightLabel="Präsent"
            />
            <SliderFilter
              label="Trockenheit"
              min={1}
              max={10}
              value={filters.sweetness || 8}
              onChange={(value) => handleFilterChange('sweetness', value)}
              leftLabel="Süss"
              rightLabel="Trocken"
            />
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-6 p-6 bg-warmwhite-light rounded-xl border border-taupe-light">
          {/* Wine Type */}
          <FilterSection title="Weinart">
            <div className="flex flex-wrap gap-2">
              {['Rotwein', 'Weisswein', 'Roséwein', 'Schaumwein', 'Dessertwein'].map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  active={(filters.wineTypes || []).includes(type)}
                  onClick={() => handleArrayFilterToggle('wineTypes', type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Country */}
          <FilterSection title="Land">
            <div className="flex flex-wrap gap-2">
              {['Schweiz', 'Frankreich', 'Italien', 'Spanien', 'Deutschland', 'Österreich', 'Portugal'].map((country) => (
                <FilterChip
                  key={country}
                  label={country}
                  active={(filters.countries || []).includes(country)}
                  onClick={() => handleArrayFilterToggle('countries', country)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Certifications */}
          <FilterSection title="Zertifizierungen">
            <div className="flex flex-wrap gap-2">
              {['Bio', 'Demeter', 'Vegan', 'Biodynamisch'].map((cert) => (
                <FilterChip
                  key={cert}
                  label={cert}
                  active={(filters.certifications || []).includes(cert)}
                  onClick={() => handleArrayFilterToggle('certifications', cert)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Preis (CHF)">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.min || ''}
                onChange={(e) =>
                  handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.max || ''}
                onChange={(e) =>
                  handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </FilterSection>

          {/* Vintage Range */}
          <FilterSection title="Jahrgang">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Von"
                value={filters.vintageRange?.min || ''}
                onChange={(e) =>
                  handleFilterChange('vintageRange', {
                    ...filters.vintageRange,
                    min: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Bis"
                value={filters.vintageRange?.max || ''}
                onChange={(e) =>
                  handleFilterChange('vintageRange', {
                    ...filters.vintageRange,
                    max: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </FilterSection>
        </div>
      )}

      {/* Sort By */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-graphite">Sortieren nach:</label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="input py-2 text-sm"
        >
          <option value="">Relevanz</option>
          <option value="price-asc">Preis aufsteigend</option>
          <option value="price-desc">Preis absteigend</option>
          <option value="name">Name A-Z</option>
          <option value="rating">Beste Bewertungen</option>
          <option value="newest">Neueste</option>
        </select>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-graphite-dark">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        active
          ? 'bg-accent-burgundy text-warmwhite'
          : 'bg-warmwhite text-graphite border border-taupe hover:border-graphite'
      )}
    >
      {label}
    </button>
  );
}

function SliderFilter({
  label,
  min,
  max,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-graphite-dark">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-taupe-light rounded-full appearance-none cursor-pointer accent-accent-burgundy"
      />
      <div className="flex items-center justify-between text-xs text-graphite/60">
        <span>{leftLabel}</span>
        <span className="font-medium text-graphite">{value}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}
