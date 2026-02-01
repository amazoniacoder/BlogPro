import React from 'react';
import { Button } from '../../button';
import { Icon } from '../../../icons/components';
import { useLocation } from 'wouter';

export const FooterEditorTab: React.FC = () => {
  const [, navigate] = useLocation();

  const handleOpenEditor = () => {
    navigate('/admin/footer-editor');
  };

  return (
    <div className="footer-editor-tab">
      <div className="footer-editor-tab__card">
        <div className="footer-editor-tab__header">
          <div className="footer-editor-tab__info">
            <Icon name="layout" size={24} />
            <div>
              <h3>Редактор футера</h3>
              <p>Создайте и настройте футер сайта с помощью визуального редактора</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenEditor}
          >
            <Icon name="edit" size={16} />
            Открыть редактор
          </Button>
        </div>
        
        <div className="footer-editor-tab__features">
          <div className="footer-editor-tab__feature">
            <Icon name="move" size={16} />
            <span>Drag & Drop интерфейс</span>
          </div>
          <div className="footer-editor-tab__feature">
            <Icon name="mobile" size={16} />
            <span>Адаптивный дизайн</span>
          </div>
          <div className="footer-editor-tab__feature">
            <Icon name="eye" size={16} />
            <span>Live preview</span>
          </div>
          <div className="footer-editor-tab__feature">
            <Icon name="clock" size={16} />
            <span>История изменений</span>
          </div>
        </div>
      </div>
    </div>
  );
};