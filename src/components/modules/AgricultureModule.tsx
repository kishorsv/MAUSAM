import React, { useState } from 'react';
import { Sprout, Droplets, Thermometer, Wind, AlertCircle, Wifi, Cpu } from 'lucide-react';
import { WeatherPayload } from '@/lib/weather/types';
import { formatTemperature } from '@/lib/utils';

export function AgricultureModule({ weather, unit = 'celsius' }: { weather: WeatherPayload; unit?: 'celsius' | 'fahrenheit' }) {
  const [showIoTModal, setShowIoTModal] = useState(false);
  const current = weather.current;
  const agri = weather.agriculture;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Agriculture & Crop Microclimate
            </h3>
            <p className="text-xs text-slate-400">
              Precipitation volume, frost probability, and IoT telemetry interface
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIoTModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-lime-400 border border-lime-500/30 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5" />
          Connect IoT Soil Sensor
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Rainfall Sum */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Expected Rain</span>
          </div>
          <div className="text-lg font-bold text-white">
            {weather.daily[0]?.precipitationSum ?? 0} mm
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            24h accumulated
          </div>
        </div>

        {/* Frost Risk */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Frost Risk</span>
          </div>
          <div className={`text-lg font-bold ${agri?.frostRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
            {agri?.frostRisk ? 'High Risk' : 'None Detected'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Min {formatTemperature(weather.daily[0]?.temperatureMin ?? current.temperature, unit)}
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>Air Humidity</span>
          </div>
          <div className="text-lg font-bold text-white">
            {current.humidity}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Transpiration index
          </div>
        </div>

        {/* Direct Soil Moisture (Strictly truth-grounded) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Sprout className="w-3.5 h-3.5 text-lime-400" />
            <span>Soil Probe Telemetry</span>
          </div>
          <div className="text-xs font-semibold text-amber-400 mt-1">
            Sensor data unavailable
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            No IoT probe linked
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Agronomic advisory: {current.precipitation > 0 ? "Surface irrigation can be suspended due to active precipitation." : current.humidity < 40 ? "Low atmospheric moisture accelerates soil evapotranspiration; monitor root moisture." : "Moderate transpiration conditions across current vegetation canopy."}
        </span>
      </div>

      {/* IoT Integration Modal */}
      {showIoTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 text-lime-400 font-semibold text-base">
              <Wifi className="w-5 h-5" />
              Agricultural IoT Gateway
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Connect external field sensors (LoRaWAN / ESP32 / Modbus Soil Probes) to stream real-time volumetric water content (VWC), electrical conductivity (EC), and soil temperature directly into Mausam.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono mb-4">
              MQTT Broker Endpoint: mqtt://iot.mausam.app:1883<br />
              Payload Schema: {"{ sensor_id, vwc_pct, temp_c }"}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowIoTModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
              >
                Close Gateway Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
