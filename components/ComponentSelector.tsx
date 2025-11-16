import React, { useState, useMemo, useEffect } from 'react';
import { ComponentType, Component, Build } from '../types';
import { components as allComponents } from '../data/mockData';
import { CloseIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface ComponentSelectorProps {
  componentType: ComponentType;
  currentBuild: Build;
  onSelect: (component: Component | null) => void;
  onClose: () => void;
}

export const checkCompatibility = (component: Component, build: Build): string[] => {
  const issues: string[] = [];
  const { CPU: cpu, Motherboard: motherboard, RAM: ram, GPU: gpu, PSU: psu, 'Case': pcCase, Cooler: cooler } = build;
  const BASE_SYSTEM_POWER = 150; // Estimated power for mobo, ram, storage, fans etc.

  switch (component.type) {
    case ComponentType.CPU:
      if (motherboard && component.specs.socket !== motherboard.specs.socket) {
        issues.push(`Incompatible socket with ${motherboard.name}`);
      }
      if (ram) {
        if (component.specs.socket?.startsWith('LGA1700') && motherboard?.specs.memoryType && ram.specs.ramType !== motherboard.specs.memoryType) {
          issues.push(`Requires ${motherboard.specs.memoryType} RAM for this motherboard`);
        }
        else if (component.specs.socket === 'AM5' && ram.specs.ramType !== 'DDR5') {
            issues.push('This CPU requires DDR5 RAM');
        }
        else if (component.specs.socket === 'AM4' && ram.specs.ramType !== 'DDR4') {
            issues.push('This CPU requires DDR4 RAM');
        }
      }
      if (psu) {
        const currentGpuPower = gpu?.specs.powerDraw || 0;
        const totalPower = (component.specs.powerDraw || 0) + currentGpuPower + BASE_SYSTEM_POWER;
        if (psu.specs.wattage && psu.specs.wattage < totalPower) {
          issues.push(`PSU may be insufficient (${psu.specs.wattage}W)`);
        }
      }
      break;
    
    case ComponentType.Motherboard:
      if (cpu && component.specs.socket !== cpu.specs.socket) {
        issues.push(`Incompatible socket with ${cpu.name}`);
      }
      if (ram && component.specs.memoryType !== ram.specs.ramType) {
        issues.push(`Incompatible RAM type with ${ram.name}`);
      }
      if (pcCase && component.specs.formFactor && pcCase.specs.supportedFormFactors && !pcCase.specs.supportedFormFactors.includes(component.specs.formFactor)) {
        issues.push(`Not supported by case form factor`);
      }
      break;

    case ComponentType.RAM:
      if (motherboard && component.specs.ramType !== motherboard.specs.memoryType) {
        issues.push(`Incompatible RAM type for ${motherboard.name}`);
      }
      if (cpu) {
        if (cpu.specs.socket === 'AM5' && component.specs.ramType !== 'DDR5') {
            issues.push('Incompatible with AM5 CPU (requires DDR5)');
        }
        else if (cpu.specs.socket === 'AM4' && component.specs.ramType !== 'DDR4') {
            issues.push('Incompatible with AM4 CPU (requires DDR4)');
        }
      }
      break;

    case ComponentType.GPU:
      if (pcCase && component.specs.length && pcCase.specs.maxGpuLength && component.specs.length > pcCase.specs.maxGpuLength) {
        issues.push(`Too long for ${pcCase.name} (max ${pcCase.specs.maxGpuLength}mm)`);
      }
      if (psu) {
        const currentCpuPower = cpu?.specs.powerDraw || 0;
        const totalPower = (component.specs.powerDraw || 0) + currentCpuPower + BASE_SYSTEM_POWER;
        if (psu.specs.wattage && psu.specs.wattage < totalPower) {
          issues.push(`PSU may be insufficient (${psu.specs.wattage}W)`);
        }
      }
      break;

    case ComponentType.PSU:
      {
        const cpuPower = cpu?.specs.powerDraw || 0;
        const gpuPower = gpu?.specs.powerDraw || 0;
        const totalPower = cpuPower + gpuPower + BASE_SYSTEM_POWER;
        if (component.specs.wattage && component.specs.wattage < totalPower) {
          issues.push(`May be insufficient wattage for current build (${totalPower}W estimated)`);
        }
      }
      break;

    case ComponentType.Case:
      if (motherboard && component.specs.supportedFormFactors && motherboard.specs.formFactor && !component.specs.supportedFormFactors.includes(motherboard.specs.formFactor)) {
        issues.push(`Does not support ${motherboard.specs.formFactor} motherboard`);
      }
      if (gpu && component.specs.maxGpuLength && gpu.specs.length && gpu.specs.length > component.specs.maxGpuLength) {
        issues.push(`GPU ${gpu.name} is too long (max ${component.specs.maxGpuLength}mm)`);
      }
      if (cooler && component.specs.maxCoolerHeight && cooler.specs.height && cooler.specs.height > component.specs.maxCoolerHeight) {
        issues.push(`CPU Cooler ${cooler.name} is too tall (max ${component.specs.maxCoolerHeight}mm)`);
      }
      break;
    
    case ComponentType.Cooler:
      if (pcCase && component.specs.height && pcCase.specs.maxCoolerHeight && component.specs.height > pcCase.specs.maxCoolerHeight) {
        issues.push(`Too tall for ${pcCase.name} (max ${pcCase.specs.maxCoolerHeight}mm)`);
      }
      break;
    
    case ComponentType.Storage:
    default:
      // No specific compatibility checks for Storage in this data model.
      break;
  }
  return issues;
};

const filterableSpecs: Partial<Record<ComponentType, (keyof Component['specs'])[]>> = {
  [ComponentType.CPU]: ['socket'],
  [ComponentType.Motherboard]: ['socket', 'formFactor', 'memoryType'],
  [ComponentType.RAM]: ['ramType', 'speed', 'size'],
  [ComponentType.Case]: ['supportedFormFactors'],
  [ComponentType.PSU]: ['efficiency'],
};

export const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  componentType,
  currentBuild,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState({ key: 'price', order: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});

  const availableFilters = useMemo(() => {
    const specKeys = filterableSpecs[componentType];
    if (!specKeys) return {};

    const options: Record<string, Set<string>> = {};
    specKeys.forEach(key => options[key] = new Set());

    allComponents
      .filter(c => c.type === componentType)
      .forEach(c => {
        specKeys.forEach(key => {
          const value = c.specs[key];
          if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => options[key].add(v.toString()));
            } else {
                options[key].add(value.toString());
            }
          }
        });
      });

    const sortedOptions: Record<string, string[]> = {};
    for(const key in options) {
        sortedOptions[key] = Array.from(options[key]).sort();
    }
    return sortedOptions;
  }, [componentType]);

  useEffect(() => {
    setFilters({}); // Reset filters when component type changes
  }, [componentType]);

  const filteredComponents = useMemo(() => {
    let components = allComponents.filter(c => c.type === componentType);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        components = components.filter(c => {
            const specValue = c.specs[key as keyof Component['specs']];
            if (Array.isArray(specValue)) {
                return specValue.includes(value as any);
            }
            return specValue?.toString() === value;
        });
      }
    });

    // Apply search term
    if (searchTerm) {
      components = components.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply sort
    components.sort((a, b) => {
      if (sort.key === 'price') {
        return sort.order === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sort.key === 'name') {
        return sort.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return components;
  }, [componentType, searchTerm, sort, filters]);

  const handleSort = (key: 'price' | 'name') => {
    setSort(prev => {
      if (prev.key === key) {
        return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { key, order: 'asc' };
    });
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col border border-blue-500/20 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold">Select {componentType}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </div>
        <div className="p-4 space-y-4 flex-shrink-0 bg-gray-900/50 border-b border-gray-700">
          <input
            type="text"
            placeholder={`Search for a ${componentType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 p-2 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-400">Sort by:</span>
                <button onClick={() => handleSort('price')} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${sort.key === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <span>Price</span>
                    {sort.key === 'price' && (sort.order === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
                <button onClick={() => handleSort('name')} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${sort.key === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <span>Name</span>
                    {sort.key === 'name' && (sort.order === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />)}
                </button>
            </div>
            {Object.entries(availableFilters).map(([key, options]) => (
                <select key={key} onChange={(e) => handleFilterChange(key, e.target.value)} value={filters[key] || ''} className="bg-gray-700 text-sm p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize">
                    <option value="">All {key.replace(/([A-Z])/g, ' $1')}</option>
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-grow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredComponents.map(component => {
              const issues = checkCompatibility(component, currentBuild);
              const isCompatible = issues.length === 0;

              return (
                <div 
                  key={component.id} 
                  className={`bg-gray-700/50 rounded-lg p-4 flex flex-col border transition-all duration-200 group ${isCompatible ? 'border-gray-600 hover:border-blue-500/80 hover:scale-[1.03] hover:bg-gray-700 cursor-pointer' : 'border-red-800/50 bg-red-900/20 opacity-60'}`}
                  onClick={() => isCompatible && onSelect(component)}
                >
                  <div className="overflow-hidden rounded-md mb-3">
                    <img src={component.imageUrl} alt={component.name} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-semibold flex-grow text-gray-200">{component.name}</h3>
                  <p className="text-blue-400 font-bold text-lg mt-2">₱{component.price.toLocaleString()}</p>
                  {!isCompatible && (
                    <div className="mt-2 text-red-400 text-xs flex items-start">
                      <WarningIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                      <span>{issues.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
             {filteredComponents.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                <h3 className="text-xl font-semibold">No Components Found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
