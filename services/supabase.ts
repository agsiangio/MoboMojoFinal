// Fix: Add a triple-slash directive to include Vite client types. This defines `import.meta.env` for TypeScript, resolving the type error.
/// <reference types="vite/client" />

import { createClient, User } from '@supabase/supabase-js';
import { Build, ComponentType, SavedBuild } from '../types';

// IMPORTANT: Switched from process.env to import.meta.env for Vite compatibility.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured. If not, we'll use Demo Mode.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "placeholder");

// --- Demo Mode (LocalStorage) Implementation ---

let demoAuthStateCallback: ((event: string, session: { user: User } | null) => void) | null = null;

const getDemoUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('mobomojo_demo_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

const setDemoUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('mobomojo_demo_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('mobomojo_demo_user');
  }
  if (demoAuthStateCallback) {
    demoAuthStateCallback('SIGNED_IN', user ? { user } : null);
  }
};

const mockAuthHandler = async (email: string, password: string) => {
  if (!email || !password || password.length < 6) {
    throw new Error("Demo: Please enter a valid email and a password of at least 6 characters.");
  }
  const mockUser = {
    id: `demo-${btoa(email)}`, // Simple unique ID for demo
    email: email,
    // Cast to User to satisfy type requirements
  } as User;
  setDemoUser(mockUser);
  return { user: mockUser, error: null };
};

const mockSignOutUser = async () => {
  setDemoUser(null);
  if (demoAuthStateCallback) {
    demoAuthStateCallback('SIGNED_OUT', null);
  }
};

const mockAuthStateObserver = (callback: (event: string, session: { user: User } | null) => void) => {
  demoAuthStateCallback = callback;
  const user = getDemoUser();
  callback('INITIAL_SESSION', user ? { user } : null);
  
  return { 
    data: { 
      subscription: { 
        unsubscribe: () => { demoAuthStateCallback = null; } 
      } 
    } 
  };
};

const getDemoBuilds = (): SavedBuild[] => {
    try {
        const buildsJson = localStorage.getItem('mobomojo_demo_builds');
        return buildsJson ? JSON.parse(buildsJson) : [];
    } catch {
        return [];
    }
};

const setDemoBuilds = (builds: SavedBuild[]) => {
    localStorage.setItem('mobomojo_demo_builds', JSON.stringify(builds));
};

const mockSaveBuild = async (userId: string, buildName: string, build: Build, totalPrice: number) => {
    const builds = getDemoBuilds();
    const components: { [key in ComponentType]?: string } = {};
    for (const key in build) {
        if (build[key as ComponentType]) {
            components[key as ComponentType] = build[key as ComponentType]!.id;
        }
    }
    const newBuild: SavedBuild = {
        id: `build-${Date.now()}`,
        user_id: userId,
        buildName,
        components,
        totalPrice,
        createdAt: new Date().toISOString(),
    };
    builds.unshift(newBuild); // Add to the beginning for newest first
    setDemoBuilds(builds);
};

const mockGetUserBuilds = async (userId: string): Promise<SavedBuild[]> => {
    return getDemoBuilds(); // In demo mode, userId is ignored.
};

const mockDeleteBuild = async (buildId: string) => {
    let builds = getDemoBuilds();
    setDemoBuilds(builds.filter(b => b.id !== buildId));
};


// --- Real Supabase Implementation ---

// Export the client so it can be used in other files (like geminiService)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// --- Exported Functions (Conditional) ---

export const signUpWithEmail = async (email, password) => {
  if (!supabase) return mockAuthHandler(email, password);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  if (!supabase) return mockAuthHandler(email, password);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  if (!supabase) return mockSignOutUser();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const authStateObserver = (callback: (event: string, session: any) => void) => {
  if (!supabase) return mockAuthStateObserver(callback);
  return supabase.auth.onAuthStateChange(callback);
};

export const saveBuildToSupabase = async (userId: string, buildName: string, build: Build, totalPrice: number) => {
  if (!supabase) return mockSaveBuild(userId, buildName, build, totalPrice);
  
  const components: { [key in ComponentType]?: string } = {};
  for (const key in build) {
      if (build[key as ComponentType]) {
          components[key as ComponentType] = build[key as ComponentType]!.id;
      }
  }

  const { error } = await supabase
    .from('builds')
    .insert([{ 
        user_id: userId, 
        buildName, 
        components, 
        totalPrice 
    }]);

  if (error) throw error;
};

export const getUserBuilds = async (userId: string): Promise<SavedBuild[]> => {
  if (!supabase) return mockGetUserBuilds(userId);

  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data as SavedBuild[];
};

export const deleteBuildFromSupabase = async (buildId: string) => {
  if (!supabase) return mockDeleteBuild(buildId);

  const { error } = await supabase
    .from('builds')
    .delete()
    .eq('id', buildId);

  if (error) throw error;
};
