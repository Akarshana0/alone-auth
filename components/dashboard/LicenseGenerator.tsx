'use client';

import { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Spinner from '@/components/ui/Spinner';
import { createLicenses, addLog } from '@/lib/firestore';
import { Zap, Copy, Download, Check } from 'lucide-react';
import type { LicenseTier } from '@/types';
import toast from 'react-hot-toast';

const tiers: { value: LicenseTier; label: string; sublabel: string }[] = [
  { value: '1day', label: '1 Day', sublabel: '24 hours' },
  { value: '1week', label: '1 Week', sublabel: '7 days' },
  { value: '1month', label: '1 Month', sublabel: '30 days' },
  { value: 'lifetime', label: 'Lifetime', sublabel: 'Never expires' },
];

export default function LicenseGenerator() {
  const [quantity, setQuantity] = useState(1);
  const [tier, setTier] = useState<LicenseTier>('1month');
  const [generating, setGenerating] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const keys = await createLicenses(quantity, tier);
      setGeneratedKeys(keys);
      await addLog('generate', 'success', `Generated ${keys.length} ${tier} license(s)`);
      toast.success(`Generated ${keys.length} license key(s)`);
    } catch (error) {
      toast.error('Failed to generate keys');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(generatedKeys.join('\n'));
    setCopied(true);
    toast.success('Copied all keys to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    const csv = 'Key,Tier,Generated\n' + generatedKeys.map(k => `${k},${tier},${new Date().toISOString()}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aloneauth-keys-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GlassCard glow="indigo">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Zap className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">License Generator</h2>
          <p className="text-sm text-gray-500">Generate and distribute license keys</p>
        </div>
      </div>

      {/* Quantity Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-gray-400 font-medium">Quantity</label>
          <span className="text-2xl font-bold text-indigo-400 font-mono">{quantity}</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-gray-700/50
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-indigo-500
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(99,102,241,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>1</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Tier Selection */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 font-medium block mb-3">License Tier</label>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((t) => (
            <button
              key={t.value}
              onClick={() => setTier(t.value)}
              className={`
                px-4 py-3 rounded-xl border text-left transition-all duration-300
                ${tier === t.value
                  ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                }
              `}
            >
              <p className={`text-sm font-semibold ${tier === t.value ? 'text-indigo-300' : 'text-gray-300'}`}>
                {t.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{t.sublabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="
          w-full py-3.5 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-indigo-600 to-violet-600
          hover:from-indigo-500 hover:to-violet-500
          text-white transition-all duration-300
          shadow-[0_0_20px_rgba(99,102,241,0.3)]
          hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        "
      >
        {generating ? (
          <><Spinner size="sm" /> Generating...</>
        ) : (
          <><Zap size={16} /> Generate {quantity} Key{quantity > 1 ? 's' : ''}</>
        )}
      </button>

      {/* Generated Keys */}
      {generatedKeys.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Generated Keys</h3>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 transition-all"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 transition-all"
              >
                <Download size={12} /> CSV
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
            {generatedKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30 border border-white/[0.04]"
              >
                <code className="text-xs font-mono text-indigo-300">{key}</code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(key);
                    toast.success('Key copied');
                  }}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
