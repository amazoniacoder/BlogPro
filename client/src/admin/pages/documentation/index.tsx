// client/src/admin/pages/documentation/index.tsx
import React, { useState } from 'react';
import { useDocumentationData } from './hooks/useDocumentationData';
import { 
  DocumentationList, 
  DocumentationForm,
  type Documentation,
  type DocumentationFormData
} from '../../../ui-system/components/admin';
import { Spinner } from '../../../ui-system/components';
import { useMenuUpdates } from '../../../hooks/useMenuUpdates';
import './documentation.css';

const AdminDocumentation: React.FC = () => {
  const { 
    documentation, 
    categories, 
    loading, 
    error, 
    createDocument, 
    updateDocument, 
    deleteDocument 
  } = useDocumentationData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');


  // Listen for real-time menu updates
  useMenuUpdates({
    onMenuUpdate: (event) => {
      console.log('📋 Documentation page received menu update:', event);
      // Could refresh documentation list if needed
    },
    onBulkSync: () => {
      console.log('📋 Bulk sync completed');
    }
  });

  const handleCreate = () => {
    setEditingDoc(null);
    setShowForm(true);
  };

  const handleEdit = (doc: Documentation) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDoc(null);
  };

  const handleSave = async (data: DocumentationFormData) => {
    try {
      if (editingDoc) {
        await updateDocument(editingDoc.id, data);
      } else {
        await createDocument(data);
      }
      setShowForm(false);
      setEditingDoc(null);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот документ?')) {
      await deleteDocument(id);
    }
  };



  if (loading) {
    return (
      <div className="admin-documentation">
        <div className="admin-documentation__loading">
          <Spinner size="lg" />
          <p>Загрузка документации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-documentation">
        <div className="admin-documentation__error">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-documentation">
      {!showForm && (
        <>

        </>
      )}

      <div className="admin-documentation__content">
        {showForm ? (
          <DocumentationForm
            onSave={handleSave}
            onCancel={handleCancel}
            categories={categories}
            editingDoc={editingDoc}
          />
        ) : (
          <DocumentationList
            documentation={documentation}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateDocument={handleCreate}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDocumentation;
