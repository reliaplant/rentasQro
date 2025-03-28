"use client";

import { useState } from 'react';
import { db, getCurrentUser } from '@/app/shared/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const createFirstAdmin = async () => {
    setLoading(true);
    setResult('');
    setError('');
    
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        setError('No user logged in! Please login first.');
        return;
      }
      
      // Create admin document
      await setDoc(doc(db, 'admins', user.uid), {
        userId: user.uid,
        email: user.email,
        name: user.displayName || 'Admin User',
        role: 'admin',
        createdAt: new Date()
      });
      
      // Also update the user document if it exists
      try {
        await setDoc(doc(db, 'users', user.uid), {
          isAdmin: true,
          name: user.displayName || '',
          email: user.email,
          lastLogin: new Date(),
        }, { merge: true });
      } catch (userUpdateError) {
        console.error('Error updating user document:', userUpdateError);
        // Continue anyway since the admin was created
      }
      
      setResult(`Successfully created admin with ID: ${user.uid}`);
      console.log('Admin created successfully!');
    } catch (error) {
      console.error('Error creating admin:', error);
      setError(`Error creating admin: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-xl font-medium text-black">Admin Setup Utility</h1>
      <p className="mt-2 text-gray-500">
        This tool will create an admin account for the currently logged in user.
      </p>
      
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-700">{result}</p>
        </div>
      )}
      
      <button
        onClick={createFirstAdmin}
        disabled={loading}
        className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {loading ? 'Creating Admin...' : 'Create Admin for Current User'}
      </button>
    </div>
  );
}
