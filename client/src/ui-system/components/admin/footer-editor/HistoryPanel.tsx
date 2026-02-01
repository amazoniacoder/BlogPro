import React from 'react';
import { AdminTable, AdminButton } from '../index';
import { Card } from '../../card';
import { Icon } from '../../../icons/components';
import { useNotification } from '../../../../hooks/useNotification';
import { useFooterHistory } from '../../../../hooks/useFooterHistory';
import type { FooterConfig } from '../../../../../../shared/types/footer';

interface HistoryPanelProps {
  configId?: number;
  onRestore?: (config: FooterConfig) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  configId,
  onRestore
}) => {
  const { showSuccess, showError } = useNotification();
  const { history, isLoading, error, loadHistory, deleteHistoryItem, clearHistory } = useFooterHistory(configId);

  const handleRestore = (historyItem: any) => {
    if (!onRestore) return;
    
    try {
      onRestore(historyItem.config);
      showSuccess('Конфигурация восстановлена из истории');
    } catch (error) {
      console.error('Error restoring config:', error);
      showError('Не удалось восстановить конфигурацию');
    }
  };

  const handleDelete = async (historyId: number) => {
    try {
      await deleteHistoryItem(historyId);
      showSuccess('Запись истории удалена');
    } catch (error) {
      showError('Ошибка удаления записи');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю?')) {
      try {
        await clearHistory();
        showSuccess('История очищена');
      } catch (error) {
        showError('Ошибка очистки истории');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!configId) {
    return (
      <Card title="История изменений">
        <div className="history-panel__empty">
          <Icon name="clock" size={48} />
          <p>Сохраните конфигурацию, чтобы увидеть историю изменений</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title="История изменений">
        <div className="history-panel__loading">
          <Icon name="loader" size={24} />
          <span>Загрузка истории...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="История изменений">
        <div className="history-panel__error">
          <Icon name="alert-circle" size={24} />
          <span>{error}</span>
          <AdminButton onClick={loadHistory} size="sm">
            Попробовать снова
          </AdminButton>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card title="История изменений">
        <div className="history-panel__empty">
          <Icon name="clock" size={48} />
          <p>История изменений пуста</p>
        </div>
      </Card>
    );
  }

  const columns = [
    {
      key: 'change',
      label: 'Изменение',
      render: (item: any) => (
        <div className="history-panel__change">
          <Icon name="edit" size={16} />
          <span>{item.changeDescription}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Дата',
      render: (item: any) => formatDate(item.createdAt)
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (item: any) => (
        <div className="history-panel__actions">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => handleRestore(item)}
          >
            <Icon name="refresh" size={14} />
            Восстановить
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="admin-button--danger"
          >
            <Icon name="delete" size={14} />
            Удалить
          </AdminButton>
        </div>
      )
    }
  ];

  return (
    <div className="history-panel">
      <Card title="История изменений">
        <div className="history-panel__header">
          <p>Всего записей: {history.length}</p>
          <div className="history-panel__header-actions">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={loadHistory}
            >
              <Icon name="refresh" size={14} />
              Обновить
            </AdminButton>
            {history.length > 0 && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={handleClearAll}
                className="admin-button--danger"
              >
                <Icon name="delete" size={14} />
                Очистить всё
              </AdminButton>
            )}
          </div>
        </div>

        <AdminTable
          data={history}
          columns={columns}
          className="history-panel__table"
        />
      </Card>
    </div>
  );
};