import React, { useState, useEffect } from 'react';
import { Button } from '@/ui-system/components/button';
import { Input } from '@/ui-system/components/input';
import { Textarea } from '../../../../ui-system/components/form';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  content: string;
  templateType: 'product_delivery';
  variables: string[];
}

export const ProductEmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableVariables = [
    'customer_name', 'customer_email', 'product_title', 
    'order_number', 'license_key', 'download_url', 
    'purchase_date', 'total_amount'
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/mailings/templates?type=product_delivery');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const url = selectedTemplate.id 
        ? `/api/mailings/templates/${selectedTemplate.id}`
        : '/api/mailings/templates';
      
      const response = await fetch(url, {
        method: selectedTemplate.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTemplate,
          templateType: 'product_delivery',
          variables: availableVariables
        })
      });

      if (response.ok) {
        await fetchTemplates();
        setIsEditing(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (!selectedTemplate) return;
    
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const textBefore = selectedTemplate.content.substring(0, cursorPos);
    const textAfter = selectedTemplate.content.substring(cursorPos);
    
    setSelectedTemplate({
      ...selectedTemplate,
      content: textBefore + `{{${variable}}}` + textAfter
    });
  };

  return (
    <div className="product-email-template-manager">
      <div className="template-manager__header">
        <h3>Product Email Templates</h3>
        <Button
          onClick={() => {
            setSelectedTemplate({
              name: '',
              subject: '',
              content: '',
              templateType: 'product_delivery',
              variables: availableVariables
            });
            setIsEditing(true);
          }}
        >
          Create New Template
        </Button>
      </div>

      <div className="template-manager__content">
        <div className="template-manager__sidebar">
          <div className="template-list">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`template-item ${selectedTemplate?.id === template.id ? 'template-item--active' : ''}`}
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsEditing(true);
                }}
              >
                <h4>{template.name}</h4>
                <p>{template.subject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="template-manager__editor">
          {selectedTemplate && isEditing && (
            <div className="template-editor">
              <div className="template-editor__fields">
                <div>
                  <label>Template Name</label>
                  <Input
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      name: e.target.value
                    })}
                    placeholder="e.g., Premium Plugin Delivery"
                  />
                </div>

                <div>
                  <label>Email Subject</label>
                  <Input
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      subject: e.target.value
                    })}
                    placeholder="🎉 Your {{product_title}} is Ready!"
                  />
                </div>

                <div className="template-editor__content">
                  <label>Email Content (HTML)</label>
                  <div className="template-editor__variables">
                    <span>Insert variables:</span>
                    {availableVariables.map(variable => (
                      <button
                        key={variable}
                        type="button"
                        className="variable-button"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    id="template-content"
                    value={selectedTemplate.content}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      content: e.target.value
                    })}
                    rows={15}
                    placeholder="Enter HTML email template..."
                  />
                </div>
              </div>

              <div className="template-editor__preview">
                <h4>Preview:</h4>
                <div 
                  className="email-preview"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                />
              </div>

              <div className="template-editor__actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
