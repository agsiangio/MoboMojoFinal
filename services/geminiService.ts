import { GoogleGenAI, Type } from "@google/genai";
import { Build, Component, ComponentType } from '../types';
import { components as allComponents } from '../data/mockData';

export interface AiSuggestion {
  type: ComponentType;
  name: string;
}

export interface AiSuggestionResponse {
  explanation: string;
  suggestions?: AiSuggestion[];
}

const getMissingComponents = (build: Build): ComponentType[] => {
    const allTypes = Object.values(ComponentType);
    return allTypes.filter(type => !build[type]);
};

const formatBuildForPrompt = (build: Build): string => {
  const buildParts = Object.entries(build)
    .filter(([, component]) => component)
    .map(([type, component]) => {
      return `- ${type}: ${component!.name} (₱${component!.price})`;
    });

  if (buildParts.length === 0) {
    return "The user has an empty build.";
  }

  return `Current build components:\n${buildParts.join('\n')}`;
};

const formatComponentDatabaseForPrompt = (): string => {
    // Only send essential info to keep the prompt smaller
    return allComponents.map(c => `Type: ${c.type}, Name: "${c.name}", Price: ${c.price}`).join('\n');
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A friendly, helpful, and encouraging analysis of the user's PC build. This should be formatted as a simple HTML string using only <h3> and <p> tags. Acknowledge the current selections, and if the build is complete, suggest bottlenecks or upgrades. If parts are missing, explain why you are suggesting the new parts. If a budget was provided, explain how you created a build within that budget."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "An array of specific, compatible components to suggest. If the user provided a budget for an empty build, this should be a FULL list of components for a new PC. Otherwise, it should only be for the EMPTY slots in the user's build. Do not suggest a component for a slot that is already filled unless generating a full build from scratch. Only suggest components from the provided database.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        description: "The type of the component being suggested (e.g., 'CPU', 'Motherboard').",
                        enum: Object.values(ComponentType)
                    },
                    name: {
                        type: Type.STRING,
                        description: "The exact name of the component from the database.",
                    }
                },
                required: ["type", "name"]
            }
        }
    },
    required: ["explanation"]
};


export const generateSuggestions = async (build: Build, currentPrice: number, budget?: number): Promise<AiSuggestionResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
    const formattedBuild = formatBuildForPrompt(build);
    const missingComponents = getMissingComponents(build);
    const componentDatabase = formatComponentDatabaseForPrompt();
    const isBuildEmpty = Object.keys(build).length === 0;

    let scenarioPrompt: string;

    if (budget) {
        if (isBuildEmpty) {
            scenarioPrompt = `**Scenario: Full Build from Scratch**
            The user has an empty build and a budget of ₱${budget.toLocaleString()}. Your task is to create a complete, balanced, and compatible PC build from scratch that provides the best possible performance for gaming and general use, while staying AT or BELOW this budget.
            - Provide a suggestion for ALL component types: ${Object.values(ComponentType).join(', ')}.
            - Your 'explanation' should describe the build you have created and why it's a good choice for the budget.`;
        } else {
            const remainingBudget = budget - currentPrice;
            scenarioPrompt = `**Scenario: Complete a Partial Build with a Budget**
            The user has a partial build and wants to complete it. Their TOTAL budget for the entire PC is ₱${budget.toLocaleString()}. The current parts cost ₱${currentPrice.toLocaleString()}, leaving ₱${remainingBudget.toLocaleString()} for the remaining parts.
            - Your task is to suggest components for the MISSING slots: ${missingComponents.join(', ')}.
            - The total cost of your suggested components MUST NOT exceed ₱${remainingBudget.toLocaleString()}. Prioritize the most critical components if the budget is tight.
            - Your 'explanation' should explain your choices for the remaining parts based on the user's existing components and the remaining budget.`;
        }
    } else {
        scenarioPrompt = `**Scenario: Analyze and Suggest for Empty Slots (No Budget)**
        The user has a partial build and has not specified a budget.
        - Your task is to suggest one compatible and well-balanced component for each of the MISSING slots: ${missingComponents.join(', ')}.
        - If there are no missing slots, analyze the build for potential bottlenecks or upgrade paths and return an empty 'suggestions' array.
        - Your 'explanation' should describe why your suggestions are a good fit for the user's existing components.`;
    }


    const prompt = `
        You are an expert PC builder AI assistant called "Mojo".
        Your task is to analyze a user's PC build and provide helpful suggestions in a structured JSON format.

        ${scenarioPrompt}

        **General Rules:**
        1.  Prioritize value and compatibility. For example, if the user has a high-end GPU, suggest a CPU that won't bottleneck it. If they have a DDR5 motherboard, only suggest DDR5 RAM.
        2.  The 'explanation' should be friendly, helpful, and encouraging, formatted as a simple HTML string using only <h3> and <p> tags.
        3.  The component names in your 'suggestions' MUST EXACTLY MATCH a name from the database provided below. Do not make up names.
        
        **User's Current Build:**
        ${formattedBuild}

        **Available Component Database (Name and Price):**
        ---
        ${componentDatabase}
        ---

        Now, provide your analysis and suggestions in the required JSON format.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });
    
    const text = response.text.trim();
    // In case the model adds markdown backticks
    const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3).trim() : text;
    
    return JSON.parse(jsonStr) as AiSuggestionResponse;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    throw new Error("Failed to communicate with the AI assistant.");
  }
};