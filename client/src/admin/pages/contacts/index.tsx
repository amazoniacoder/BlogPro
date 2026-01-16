import { useState, useEffect } from 'react';
import { useToast } from '@/ui-system/components/feedback';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contact', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      showError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          to: selectedContact.email,
          subject: `Re: Message from ${selectedContact.firstName} ${selectedContact.lastName}`,
          message: replyMessage
        })
      });

      if (response.ok) {
        showSuccess('Reply sent successfully!');
        setReplyMessage('');
        setSelectedContact(null);
      } else {
        showError('Failed to send reply');
      }
    } catch (error) {
      showError('Failed to send reply');
    }
  };

  if (loading) {
    return <div className="admin-section">Loading contacts...</div>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Contact Messages</h2>
      </div>

      <div className="admin-contacts grid-cols-1">
        <div className="admin-contacts__list">
          {contacts.map(contact => (
            <div 
              key={contact.id}
              className={`admin-contacts__item ${selectedContact?.id === contact.id ? 'admin-contacts__item--active' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="admin-contacts__item-header">
                <strong>{contact.firstName} {contact.lastName}</strong>
                <span className="admin-contacts__item-date">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="admin-contacts__item-email">{contact.email}</div>
            </div>
          ))}
        </div>

        {selectedContact && (
          <div className="admin-contacts__detail">
            <div className="admin-card">
              <div className="admin-card__header">
                <h3 className="admin-card__title">Message from {selectedContact.firstName} {selectedContact.lastName}</h3>
                <button 
                  className="admin-button admin-button--secondary"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </button>
              </div>
              
              <div className="admin-contacts__message">
                <p><strong>From:</strong> {selectedContact.firstName} {selectedContact.lastName} ({selectedContact.email})</p>
                <p><strong>Date:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                <div className="admin-contacts__message-content">
                  {selectedContact.message}
                </div>
              </div>

              <div className="admin-contacts__reply">
                <h4>Send Reply</h4>
                <textarea
                  className="admin-form__textarea"
                  rows={6}
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <div className="admin-form__actions">
                  <button 
                    className="admin-button admin-button--primary"
                    onClick={sendReply}
                    disabled={!replyMessage.trim()}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
