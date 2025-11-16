export enum ComponentType {
  CPU = 'CPU',
  Motherboard = 'Motherboard',
  RAM = 'RAM',
  GPU = 'GPU',
  Storage = 'Storage',
  PSU = 'PSU',
  Case = 'Case',
  Cooler = 'Cooler',
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  price: number;
  imageUrl: string;
  specs: {
    // CPU
    socket?: string;
    cores?: string;
    powerDraw?: number; // in watts
    supportedRamSpeed?: string; // e.g. '3200MHz' for DDR4, '5200MHz' for DDR5 official support/sweet spot

    // Motherboard
    formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
    chipset?: string;
    memoryType?: 'DDR4' | 'DDR5';
    supportedRamSpeeds?: string[]; // e.g. ['2666MHz', '3200MHz', '3600MHz (OC)']

    // RAM
    ramType?: 'DDR4' | 'DDR5';
    speed?: string;
    size?: string;
    
    // GPU
    vram?: string;
    length?: number; // in mm
    
    // PSU
    wattage?: number;
    efficiency?: string;
    
    // Case
    supportedFormFactors?: ('ATX' | 'Micro-ATX' | 'Mini-ITX')[];
    maxGpuLength?: number; // in mm
    maxCoolerHeight?: number; // in mm
    
    // Cooler
    height?: number; // in mm
  };
}

export type Build = {
  [key in ComponentType]?: Component | null;
};

export type SavedBuild = {
  id: string;
  user_id: string;
  buildName: string;
  components: { [key in ComponentType]?: string; };
  createdAt: string; // Changed to string for Supabase timestamp
  totalPrice: number;
};

export interface AiSuggestion {
  type: ComponentType;
  name: string;
}

export interface AiSuggestionResponse {
  explanation: string;
  suggestions?: AiSuggestion[];
}