import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Sections Manager
 * 
 * Component for managing hierarchical documentation sections.
 */

import React, { useState, useEffect } from 'react';

interface Section {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  children?: Section[];
}

export const SectionsManager: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetch('/api/documentation/sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Failed to load sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (sectionData: Partial<Section>) => {
    try {
      const response = await fetch('/api/documentation/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });
      
      if (response.ok) {
        await loadSections();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleUpdateSection = async (id: string, sectionData: Partial<Section>) => {
    try {
      const response = await fetch(`/api/documentation/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData)
      });
      
      if (response.ok) {
        await loadSections();
        setEditingSection(null);
      }
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    try {
      const response = await fetch(`/api/documentation/sections/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadSections();
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const renderSectionTree = (sections: Section[], level = 0) => {
    return sections.map(section => (
      <div key={section.id} className="section-node" style={{ marginLeft: `${level * 20}px` }}>
        <div className="section-node__header">
          <span className="section-node__icon">{section.icon || '📁'}</span>
          <span className="section-node__name">{section.name}</span>
          <span className="section-node__slug">({section.slug})</span>
          
          <div className="section-node__actions">
            <button
              onClick={() => setEditingSection(section)}
              className="btn btn--small btn--secondary"
            >
              <Icon name="edit" size={16} /> Edit
            </button>
            <button
              onClick={() => handleDeleteSection(section.id)}
              className="btn btn--small btn--danger"
            >
              <Icon name="delete" size={16} /> Delete
            </button>
          </div>
        </div>
        
        {section.description && (
          <div className="section-node__description">{section.description}</div>
        )}
        
        {section.children && section.children.length > 0 && (
          <div className="section-node__children">
            {renderSectionTree(section.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div className="loading">Loading sections...</div>;
  }

  return (
    <div className="sections-manager">
      <div className="sections-manager__header">
        <h1>📁 Sections Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn--primary"
        >
          <Icon name="add" size={16} /> Create Section
        </button>
      </div>

      <div className="sections-tree">
        {sections.length > 0 ? (
          renderSectionTree(sections)
        ) : (
          <div className="empty-state">
            <p>No sections found. Create your first section to get started.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <SectionModal
          title="Create New Section"
          onSave={handleCreateSection}
          onClose={() => setShowCreateModal(false)}
          parentSections={sections}
        />
      )}

      {editingSection && (
        <SectionModal
          title="Edit Section"
          section={editingSection}
          onSave={(data) => handleUpdateSection(editingSection.id, data)}
          onClose={() => setEditingSection(null)}
          parentSections={sections}
        />
      )}
    </div>
  );
};

interface SectionModalProps {
  title: string;
  section?: Section;
  onSave: (data: Partial<Section>) => void;
  onClose: () => void;
  parentSections: Section[];
}

const SectionModal: React.FC<SectionModalProps> = ({
  title,
  section,
  onSave,
  onClose,
  parentSections
}) => {
  const [formData, setFormData] = useState({
    name: section?.name || '',
    slug: section?.slug || '',
    description: section?.description || '',
    parent_id: section?.parent_id || '',
    icon: section?.icon || '📁'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: section ? formData.slug : generateSlug(name)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal__close">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal__content">
          <div className="form-group">
            <label>Section Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Parent Section</label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            >
              <option value="">No Parent (Root Level)</option>
              {parentSections.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="📁"
            />
          </div>
          
          <div className="modal__actions">
            <button type="button" onClick={onClose} className="btn btn--secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {section ? 'Update' : 'Create'} Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
