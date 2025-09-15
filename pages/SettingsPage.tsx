import React, { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';
import { settingsService } from '../services/settingsService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/Spinner';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    const data = await settingsService.getSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      setSettings({
        ...settings,
        [e.target.name]: parseFloat(e.target.value) || 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setIsSaving(true);
      await settingsService.saveSettings(settings);
      setIsSaving(false);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Application Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Currency Exchange</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Set the daily exchange rate for automatic price conversion.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">1 USD =</span>
            <Input
              type="number"
              name="exchangeRateUSD_ETB"
              id="exchangeRateUSD_ETB"
              value={settings?.exchangeRateUSD_ETB.toString() || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              containerClassName="mb-0 flex-grow"
            />
             <span className="text-gray-700 font-medium">ETB</span>
          </div>
        </div>

        <div className="flex justify-end items-center space-x-4 pt-4">
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <Button type="submit" variant="primary" disabled={isSaving} leftIcon={isSaving ? <Spinner size="sm"/> : null}>
                {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
        </div>
      </form>
    </div>
  );
};