import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserBuilds, deleteBuildFromSupabase } from '../services/supabase';
import { SavedBuild } from '../types';
import { TrashIcon } from '../components/icons';

interface ProfilePageProps {
  onLoadBuild: (build: SavedBuild) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLoadBuild }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBuilds = async () => {
        setIsLoading(true);
        try {
          const userBuilds = await getUserBuilds(user.id);
          // Sort builds by creation date, newest first
          userBuilds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBuilds(userBuilds);
        } catch (error) {
          console.error("Failed to fetch builds:", error);
          addToast("Failed to load your saved builds.", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBuilds();
    } else {
      setIsLoading(false);
      setBuilds([]);
    }
  }, [user, addToast]);

  const handleDeleteBuild = async (buildId: string) => {
    if (window.confirm("Are you sure you want to delete this build permanently?")) {
      try {
        await deleteBuildFromSupabase(buildId);
        setBuilds(builds.filter(b => b.id !== buildId));
        addToast("Build deleted successfully.", "success");
      } catch (error) {
        addToast("Failed to delete build. Please try again.", "error");
        console.error("Delete error:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center bg-gray-800 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-400">Please log in to view your profile and saved builds.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
      <p className="text-gray-400 mb-6">Welcome, {user.email}</p>

      <h3 className="text-2xl font-semibold border-b border-gray-600 pb-2 mb-4">Saved Builds</h3>
      
      {builds.length > 0 ? (
        <div className="space-y-4">
          {builds.map(build => (
            <div key={build.id} className="bg-gray-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-xl font-bold text-blue-300">{build.buildName}</p>
                <p className="text-sm text-gray-400">Saved on: {new Date(build.createdAt).toLocaleDateString()}</p>
                <p className="text-lg font-medium text-white mt-1">Total: ₱{build.totalPrice.toLocaleString()}</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button 
                  onClick={() => onLoadBuild(build)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-lg transition duration-300"
                >
                  Load
                </button>
                <button 
                  onClick={() => handleDeleteBuild(build.id)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8 bg-gray-700/30 rounded-lg">You have no saved builds yet. Go to the builder to create one!</p>
      )}
    </div>
  );
};

export default ProfilePage;