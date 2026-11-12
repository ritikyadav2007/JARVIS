import React, { useState } from 'react';

export const PhoneHubView: React.FC = () => {
  const [pairingNotice, setPairingNotice] = useState<string | null>(null);

  const handlePairingRequest = (device: 'iPhone' | 'Android') => {
    setPairingNotice(`Initiating ${device} local discovery protocol... Device must be on the same local Wi-Fi or connected via USB. (Phase 2 pairing exchange)`);
    setTimeout(() => setPairingNotice(null), 5000);
  };

  return (
    <div className="jarvis-card phone-hub-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            CROSS-DEVICE PHONE COMMAND HUB
          </h3>
          <p className="card-subtitle">
            Secure multi-device bridge architecture for Apple iOS and Google Android integration.
          </p>
        </div>
      </div>

      {pairingNotice && (
        <div className="hud-feedback-alert">
          <span>{pairingNotice}</span>
        </div>
      )}

      <div className="phone-devices-grid">
        {/* Device 1: Apple iPhone */}
        <div className="phone-device-card">
          <div className="phone-card-top">
            <div className="device-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8">
                <rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect>
                <line x1="12" y1="19" x2="12.01" y2="19"></line>
              </svg>
            </div>
            <div className="device-title-box">
              <h4 className="device-heading">Apple iPhone</h4>
              <span className="device-os">iOS 18+ Integration Bridge</span>
            </div>
            <span className="device-status-badge status-unpaired">
              NOT CONNECTED
            </span>
          </div>

          <div className="device-telemetry-body">
            <div className="telemetry-line">
              <span className="t-label">Device Name:</span>
              <span className="t-val text-dim">None (Awaiting Pairing)</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Pairing Protocol:</span>
              <span className="t-val">Local Wi-Fi / Bluetooth LE</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Last Synchronized:</span>
              <span className="t-val text-dim">Never</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Security Protocol:</span>
              <span className="t-val text-emerald">End-to-End Local Key Exchange</span>
            </div>
          </div>

          <div className="supported-features-box">
            <span className="features-title">SUPPORTED ARCHITECTURE:</span>
            <ul className="features-list">
              <li>✓ Bidirectional Clipboard & Link Sharing</li>
              <li>✓ Remote Push-to-Talk Voice Prompts</li>
              <li>✓ Instant Notification Mirroring</li>
              <li>✓ Apple Shortcuts Trigger Bridge</li>
              <li>✓ Offline Local Storage Encryption</li>
            </ul>
          </div>

          <div className="device-actions-strip">
            <button
              className="hud-button hud-button-cyan"
              onClick={() => handlePairingRequest('iPhone')}
            >
              Pair iPhone
            </button>
            <button className="hud-button-subtle" disabled title="No active connection to disconnect">
              Disconnect
            </button>
          </div>
        </div>

        {/* Device 2: Google Android */}
        <div className="phone-device-card">
          <div className="phone-card-top">
            <div className="device-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <circle cx="12" cy="18" r="1"></circle>
              </svg>
            </div>
            <div className="device-title-box">
              <h4 className="device-heading">Google Android</h4>
              <span className="device-os">Android 14+ / ADB Integration</span>
            </div>
            <span className="device-status-badge status-unpaired">
              NOT CONNECTED
            </span>
          </div>

          <div className="device-telemetry-body">
            <div className="telemetry-line">
              <span className="t-label">Device Name:</span>
              <span className="t-val text-dim">None (Awaiting Pairing)</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Pairing Protocol:</span>
              <span className="t-val">ADB over Wi-Fi / Local IPC</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Last Synchronized:</span>
              <span className="t-val text-dim">Never</span>
            </div>
            <div className="telemetry-line">
              <span className="t-label">Security Protocol:</span>
              <span className="t-val text-emerald">RSA Key Authorization</span>
            </div>
          </div>

          <div className="supported-features-box">
            <span className="features-title">SUPPORTED ARCHITECTURE:</span>
            <ul className="features-list">
              <li>✓ Android Device Hub Screen Mirroring</li>
              <li>✓ Local Shell & Automation Commands</li>
              <li>✓ Real-Time Battery & Hardware Telemetry</li>
              <li>✓ Secure File Transfer Protocol</li>
              <li>✓ Push Notification Mirroring</li>
            </ul>
          </div>

          <div className="device-actions-strip">
            <button
              className="hud-button hud-button-emerald"
              onClick={() => handlePairingRequest('Android')}
            >
              Pair Android Device
            </button>
            <button className="hud-button-subtle" disabled title="No active connection to disconnect">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
