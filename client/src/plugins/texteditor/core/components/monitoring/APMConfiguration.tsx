import React, { useState, useEffect } from 'react';
import { APMService, APMConfig } from '../../services/monitoring/APMService';

interface APMConfigurationProps {
  readonly onConfigChange?: (enabled: boolean) => void;
  readonly className?: string;
}

export const APMConfiguration: React.FC<APMConfigurationProps> = ({
  onConfigChange,
  className = ''
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [queueStats, setQueueStats] = useState({ metricsCount: 0, errorsCount: 0 });
  const [config, setConfig] = useState({
    endpoint: '',
    apiKey: '',
    serviceName: 'text-editor',
    environment: 'development' as const
  });

  useEffect(() => {
    const apmService = APMService.getInstance();
    if (apmService) {
      setIsEnabled(true);
      const stats = apmService.getQueueStats();
      setQueueStats(stats);
      
      const interval = setInterval(() => {
        const updatedStats = apmService.getQueueStats();
        setQueueStats(updatedStats);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const handleEnableAPM = () => {
    if (!isEnabled) {
      const apmConfig: APMConfig = {
        enabled: true,
        endpoint: config.endpoint || 'https://api.example.com/apm',
        apiKey: config.apiKey || 'demo-key',
        serviceName: config.serviceName,
        environment: config.environment
      };
      
      APMService.initialize(apmConfig);
      setIsEnabled(true);
      onConfigChange?.(true);
    }
  };

  const handleDisableAPM = () => {
    const apmService = APMService.getInstance();
    apmService?.destroy();
    setIsEnabled(false);
    onConfigChange?.(false);
  };

  return (
    <div className={`apm-configuration ${className}`}>
      <div className="apm-header">
        <h4>Мониторинг APM</h4>
        <div className={`apm-status ${isEnabled ? 'enabled' : 'disabled'}`}>
          {isEnabled ? '🟢 Включен' : '🔴 Отключен'}
        </div>
      </div>

      {!isEnabled && (
        <div className="apm-setup">
          <div className="config-field">
            <label>Имя сервиса:</label>
            <input
              type="text"
              value={config.serviceName}
              onChange={(e) => setConfig({ ...config, serviceName: e.target.value })}
            />
          </div>
          
          <div className="config-field">
            <label>Окружение:</label>
            <select
              value={config.environment}
              onChange={(e) => setConfig({ ...config, environment: e.target.value as any })}
            >
              <option value="development">Разработка</option>
              <option value="staging">Тестирование</option>
              <option value="production">Продакшен</option>
            </select>
          </div>
          
          <button onClick={handleEnableAPM} className="enable-apm-btn">
            Включить мониторинг APM
          </button>
        </div>
      )}

      {isEnabled && (
        <div className="apm-stats">
          <div className="stat-item">
            <span>Метрики в очереди: {queueStats.metricsCount}</span>
          </div>
          <div className="stat-item">
            <span>Ошибки в очереди: {queueStats.errorsCount}</span>
          </div>
          <button onClick={handleDisableAPM}>Отключить APM</button>
        </div>
      )}
    </div>
  );
};
