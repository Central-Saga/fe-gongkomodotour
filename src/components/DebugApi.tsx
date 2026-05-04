"use client";

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import axios from 'axios';
import { fallbackRequest } from '@/lib/fallbackRequest';

export default function DebugApi() {
  const [apiData, setApiData] = useState<any>(null);
  const [fetchData, setFetchData] = useState<any>(null);
  const [axiosData, setAxiosData] = useState<any>(null);
  const [fallbackData, setFallbackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [axiosError, setAxiosError] = useState<string | null>(null);
  const [fallbackError, setFallbackError] = useState<string | null>(null);

  // Test with apiRequest
  useEffect(() => {
    const fetchWithApiRequest = async () => {
      try {
        console.log('Fetching with apiRequest...');
        const response = await apiRequest('GET', '/api/landing-page/trips?status=1&type=open');
        console.log('apiRequest Response:', response);
        setApiData(response);
      } catch (err: any) {
        console.error('Error with apiRequest:', err);
        setError(err?.message || 'An error occurred with apiRequest');
      }
    };

    fetchWithApiRequest();
  }, []);

  // Test with native fetch
  useEffect(() => {
    const fetchWithNativeFetch = async () => {
      try {
        console.log('Fetching with native fetch...');
        const response = await fetch('https://api.gongkomodotour.com/api/landing-page/trips?status=1&type=open');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetch Response:', data);
        setFetchData(data);
      } catch (err: any) {
        console.error('Error with fetch:', err);
        setFetchError(err?.message || 'An error occurred with fetch');
      }
    };

    fetchWithNativeFetch();
  }, []);

  // Test with fallback request
  useEffect(() => {
    const fetchWithFallback = async () => {
      try {
        console.log('Fetching with fallback request...');
        const data = await fallbackRequest('GET', '/api/landing-page/trips?status=1&type=open');
        console.log('Fallback Response:', data);
        setFallbackData(data);
      } catch (err: any) {
        console.error('Error with fallback request:', err);
        setFallbackError(err?.message || 'An error occurred with fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchWithFallback();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">API Debug Tests</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">API Configuration:</h3>
        <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'}</p>
        <p><strong>Current Request:</strong> {'/api/landing-page/trips?status=1&type=open'}</p>
        <p><strong>Full URL:</strong> {`${process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'}/api/landing-page/trips?status=1&type=open`}</p>
      </div>
      
      {loading && <p>Testing API connections...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* apiRequest Test */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">apiRequest Test</h3>
          {error ? (
            <div className="bg-red-100 p-2 rounded mb-2">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          ) : apiData ? (
            <div className="bg-green-100 p-2 rounded">
              <p className="text-green-700">Success! {apiData?.data?.length || 0} items</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        
        {/* Native Fetch Test */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Native Fetch Test</h3>
          {fetchError ? (
            <div className="bg-red-100 p-2 rounded mb-2">
              <p className="text-red-700 text-sm">Error: {fetchError}</p>
            </div>
          ) : fetchData ? (
            <div className="bg-green-100 p-2 rounded">
              <p className="text-green-700">Success! {fetchData?.data?.length || 0} items</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
        
        {/* Fallback Test */}
        <div className="border rounded p-4">
          <h3 className="font-bold mb-2">Fallback XHR Test</h3>
          {fallbackError ? (
            <div className="bg-red-100 p-2 rounded mb-2">
              <p className="text-red-700 text-sm">Error: {fallbackError}</p>
            </div>
          ) : fallbackData ? (
            <div className="bg-green-100 p-2 rounded">
              <p className="text-green-700">Success! {fallbackData?.data?.length || 0} items</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* apiRequest Data */}
        <div>
          <h3 className="font-semibold mb-2">apiRequest Data:</h3>
          {apiData ? (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-72">
              {JSON.stringify(apiData, null, 2).substring(0, 300)}...
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>
        
        {/* Fetch Data */}
        <div>
          <h3 className="font-semibold mb-2">Fetch Data:</h3>
          {fetchData ? (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-72">
              {JSON.stringify(fetchData, null, 2).substring(0, 300)}...
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>
        
        {/* Fallback Data */}
        <div>
          <h3 className="font-semibold mb-2">Fallback Data:</h3>
          {fallbackData ? (
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-72">
              {JSON.stringify(fallbackData, null, 2).substring(0, 300)}...
            </pre>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
