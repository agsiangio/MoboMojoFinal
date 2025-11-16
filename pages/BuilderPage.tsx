import React, { useState, useMemo } from 'react';
import { Build, Component, ComponentType, AiSuggestion } from '../types';
import { 
    CpuIcon, MotherboardIcon, RamIcon, GpuIcon, StorageIcon, PsuIcon, CaseIcon, CoolerIcon, WarningIcon, CheckCircleIcon, AiIcon, TrashIcon, SaveIcon, CloseIcon, InfoIcon
} from '../components/icons';
import { ComponentSelector, checkCompatibility } from '../components/ComponentSelector';
import AiAssistant from '../components/AiAssistant';
import ComponentDetailsModal from '../components/ComponentDetailsModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { saveBuildToSupabase } from '../services/supabase';
import { components as allComponents } from '../data/mockData';

interface BuilderPageProps {
  build: Build;
  onBuildChange: (build: Build) => void;
}

const componentTypeIcons: Record<ComponentType, React.ReactNode> = {
  [ComponentType.CPU]: <CpuIcon className="w-8 h-8" />,
  [ComponentType.Motherboard]: <MotherboardIcon className="w-8 h-8" />,
  [ComponentType.RAM]: <RamIcon className="w-8 h-8" />,
  [ComponentType.GPU]: <GpuIcon className="w-8 h-8" />,
  [ComponentType.Storage]: <StorageIcon className="w-8 h-8" />,
  [ComponentType.PSU]: <PsuIcon className="w-8 h-8" />,
  [ComponentType.Case]: <CaseIcon className="w-8 h-8" />,
  [ComponentType.Cooler]: <CoolerIcon className="w-8 h-8" />,
};

const BuilderPage: React.FC<BuilderPageProps> = ({ build, onBuildChange }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [componentToView, setComponentToView] = useState<Component | null>(null);
  const [buildName, setBuildName] = useState('');
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const hasComponents = useMemo(() => Object.values(build).some(c => !!c), [build]);

  const handleSelectComponent = (componentType: ComponentType) => {
    setSelectedComponentType(componentType);
    setIsSelectorOpen(true);
  };

  const handleComponentChosen = (component: Component | null) => {
    if (selectedComponentType) {
      onBuildChange({
        ...build,
        [selectedComponentType]: component,
      });
    }
    setIsSelectorOpen(false);
    setSelectedComponentType(null);
  };

  const handleRemoveComponent = (componentType: ComponentType) => {
    const newBuild = {...build};
    delete newBuild[componentType];
    onBuildChange(newBuild);
  };
  
  const handleClearBuild = () => {
    onBuildChange({});
    addToast('Build cleared.', 'info');
    setIsClearConfirmOpen(false);
  };

  const { totalPrice, compatibilityIssues } = useMemo(() => {
    const price = Object.values(build).filter((c): c is Component => !!c).reduce((acc, component) => acc + component.price, 0);
    
    const issues = Object.values(ComponentType).reduce((acc, type) => {
      const component = build[type];
      if (component) {
        const componentIssues = checkCompatibility(component, build);
        if (componentIssues.length > 0) {
          acc[type] = componentIssues;
        }
      }
      return acc;
    }, {} as Record<ComponentType, string[]>);

    return { totalPrice: price, compatibilityIssues: issues };
  }, [build]);
  
  const handleSaveBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        addToast('You must be logged in to save a build.', 'error');
        return;
    }
    if (!buildName.trim() || !hasComponents) {
        addToast('Please name your build and add at least one component.', 'error');
        return;
    }
    try {
      await saveBuildToSupabase(user.id, buildName, build, totalPrice);
      addToast('Build saved successfully!', 'success');
      setIsSaveModalOpen(false);
      setBuildName('');
    } catch (error) {
      addToast('Failed to save build. Please try again.', 'error');
      console.error("Save build error:", error);
    }
  };

  const handleApplyAiSuggestions = (suggestions: AiSuggestion[]) => {
    const newBuild = { ...build };
    let componentsAdded = 0;
    suggestions.forEach(suggestion => {
        // Only apply if the slot is empty OR if the AI is generating a full build
        if (!newBuild[suggestion.type] || suggestions.length > 1) {
            const componentToAdd = allComponents.find(c => c.name === suggestion.name && c.type === suggestion.type);
            if (componentToAdd) {
                newBuild[suggestion.type] = componentToAdd;
                componentsAdded++;
            }
        }
    });
    onBuildChange(newBuild);
    if(componentsAdded > 0) {
        addToast(`${componentsAdded} component(s) added by the AI Assistant.`, 'success');
    } else {
        addToast('No empty slots to apply suggestions to.', 'info');
    }
  };
  
  const componentOrder: ComponentType[] = [
    ComponentType.CPU, ComponentType.Motherboard, ComponentType.RAM, ComponentType.GPU, 
    ComponentType.Storage, ComponentType.PSU, ComponentType.Case, ComponentType.Cooler
  ];

  return (
    <>
      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-2xl border border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Your PC Build</h2>
            <p className="text-gray-400 mt-1">Select components to start building your dream PC.</p>
          </div>
          <div className="grid grid-cols-3 sm:flex sm:space-x-2 gap-2 mt-4 md:mt-0 w-full md:w-auto">
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-md glow-on-hover"
            >
              <AiIcon className="w-5 h-5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
            <button
                onClick={() => setIsSaveModalOpen(true)}
                disabled={!hasComponents}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-md glow-on-hover"
            >
                <SaveIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Save</span>
            </button>
            <button
                onClick={() => hasComponents && setIsClearConfirmOpen(true)}
                disabled={!hasComponents}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed shadow-md glow-on-hover"
            >
                <TrashIcon />
                <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {componentOrder.map(type => {
            const component = build[type];
            const issues = compatibilityIssues[type];
            return (
              <div key={type} className={`p-4 rounded-lg flex flex-col md:flex-row md:items-center transition duration-300 border ${issues ? 'bg-red-900/40 border-red-500/50' : 'bg-gray-700/50 border-gray-700'}`}>
                <div className="flex items-center w-full">
                    <div className={`mr-4 flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${issues ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-300'}`}>{componentTypeIcons[type]}</div>
                    <div className="flex-grow flex items-center">
                      {component && (
                        <img src={component.imageUrl} alt={component.name} className="w-12 h-12 object-cover rounded-md mr-4 hidden sm:block" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg text-white">{type}</h3>
                        {component ? (
                          <div>
                              <p className="text-gray-200">{component.name}</p>
                              {issues && <div className="text-red-400 text-xs mt-1 flex items-center"><WarningIcon className="w-4 h-4 mr-1"/>{issues.join(', ')}</div>}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Not selected</p>
                        )}
                      </div>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-3 md:mt-0 md:pl-4 flex-shrink-0">
                    {component && <span className="text-lg font-medium text-blue-300 w-28 text-right">₱{component.price.toLocaleString()}</span>}
                    {component && (
                        <button onClick={() => setComponentToView(component)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-md hover:bg-gray-600">
                            <InfoIcon />
                        </button>
                    )}
                    <button 
                        onClick={() => handleSelectComponent(type)} 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 w-28 text-center shadow-md glow-on-hover"
                    >
                        {component ? 'Change' : 'Select'}
                    </button>
                    {component && (
                        <button onClick={() => handleRemoveComponent(type)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-gray-600">
                            <TrashIcon />
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="sticky bottom-0 mt-8 z-10">
        <div className="bg-gray-900/70 backdrop-blur-md rounded-t-xl border-t border-b border-white/10 shadow-2xl flex justify-between items-center p-4">
          <div>
            {Object.keys(compatibilityIssues).length > 0 ? (
                <div className="flex items-center text-red-400">
                    <WarningIcon className="w-6 h-6 mr-2" />
                    <span className="font-semibold text-sm sm:text-base">Compatibility issues found!</span>
                </div>
            ) : (
                 hasComponents &&
                <div className="flex items-center text-green-400">
                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                    <span className="font-semibold text-sm sm:text-base">All parts are compatible.</span>
                </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm sm:text-base">Estimated Total:</p>
            <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">₱{totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isSelectorOpen && selectedComponentType && (
        <ComponentSelector
          componentType={selectedComponentType}
          currentBuild={build}
          onSelect={handleComponentChosen}
          onClose={() => setIsSelectorOpen(false)}
        />
      )}
      
      {isAiAssistantOpen && (
        <AiAssistant
            build={build}
            totalPrice={totalPrice}
            onClose={() => setIsAiAssistantOpen(false)}
            onApplySuggestions={handleApplyAiSuggestions}
        />
      )}
      
      {componentToView && (
          <ComponentDetailsModal 
            component={componentToView}
            onClose={() => setComponentToView(null)}
          />
      )}

      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearBuild}
        title="Clear Build?"
        message="Are you sure you want to remove all components from your current build?"
      />

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-gray-800 rounded-xl w-full max-w-md flex flex-col border border-gray-700 shadow-lg">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Save Your Build</h2>
              <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>
            <form onSubmit={handleSaveBuild} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Enter build name (e.g., My Gaming Rig)"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                required
                className="w-full bg-gray-700 p-3 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md glow-on-hover"
              >
                Save Build
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BuilderPage;