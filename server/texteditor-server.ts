import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage for documents and revisions
// In production, this would use a database
const documents = new Map();
const revisions = new Map();
const activeCollaborators = new Map();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Parse JSON bodies
app.use(express.json());

// Document API routes
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  
  if (documents.has(id)) {
    res.json(documents.get(id));
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

app.post('/api/documents', (req, res) => {
  const { content, userId, userName } = req.body;
  const id = uuidv4();
  
  const document = {
    id,
    content,
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  documents.set(id, document);
  
  // Create initial revision
  const revisionId = uuidv4();
  const revision = {
    id: revisionId,
    documentId: id,
    content,
    createdBy: userId,
    createdByName: userName,
    createdAt: new Date().toISOString(),
    description: 'Initial version'
  };
  
  if (!revisions.has(id)) {
    revisions.set(id, []);
  }
  
  revisions.get(id).push(revision);
  
  res.status(201).json(document);
});

app.put('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (documents.has(id)) {
    const document = documents.get(id);
    
    document.content = content;
    document.updatedAt = new Date().toISOString();
    
    documents.set(id, document);
    
    res.json(document);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Revisions API routes
app.get('/api/documents/:id/revisions', (req, res) => {
  const { id } = req.params;
  
  if (revisions.has(id)) {
    res.json(revisions.get(id));
  } else {
    res.json([]);
  }
});

app.post('/api/documents/:id/revisions', (req, res) => {
  const { id } = req.params;
  const { content, userId, userName, description } = req.body;
  
  if (documents.has(id)) {
    const revisionId = uuidv4();
    const revision = {
      id: revisionId,
      documentId: id,
      content,
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date().toISOString(),
      description: description || `Revision ${new Date().toLocaleString()}`
    };
    
    if (!revisions.has(id)) {
      revisions.set(id, []);
    }
    
    revisions.get(id).push(revision);
    
    res.status(201).json(revision);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// WebSocket handling
wss.on('connection', (ws) => {
  let userId: string | null = null;
  let documentId: string | null = null;
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'JOIN_DOCUMENT':
          userId = data.payload.userId;
          documentId = data.payload.documentId;
          
          // Add user to active collaborators
          if (!activeCollaborators.has(documentId)) {
            activeCollaborators.set(documentId, new Map());
          }
          
          activeCollaborators.get(documentId).set(userId, {
            id: userId,
            name: data.payload.userName,
            avatar: data.payload.userAvatar,
            color: getRandomColor(),
            cursorPosition: { start: 0, end: 0 }
          });
          
          // Broadcast updated collaborators list
          if (documentId) {
            broadcastCollaborators(documentId);
          }
          break;
          
        case 'OPERATION':
          if (documentId && userId) {
            // Broadcast operation to all clients except sender
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'OPERATION',
                  payload: {
                    documentId: data.payload.documentId,
                    userId: data.payload.userId,
                    operation: data.payload.operation
                  }
                }));
              }
            });
            
            // Update document content (in a real implementation, this would apply the operation)
            if (documents.has(documentId)) {
              const document = documents.get(documentId);
              // In a real implementation, we would apply the operation to the document
              document.updatedAt = new Date().toISOString();
            }
          }
          break;
          
        case 'CURSOR_UPDATE':
          if (documentId && userId && activeCollaborators.has(documentId)) {
            const collaborator = activeCollaborators.get(documentId).get(userId);
            
            if (collaborator) {
              collaborator.cursorPosition = data.payload.position;
              
              // Broadcast cursor position to all clients except sender
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'CURSOR_UPDATE',
                    payload: {
                      documentId,
                      userId,
                      position: data.payload.position
                    }
                  }));
                }
              });
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    if (documentId && userId && activeCollaborators.has(documentId)) {
      // Remove user from active collaborators
      activeCollaborators.get(documentId).delete(userId);
      
      // Broadcast updated collaborators list
      if (documentId) {
        broadcastCollaborators(documentId);
      }
    }
  });
});

// Helper function to broadcast collaborators list
function broadcastCollaborators(documentId: string) {
  if (activeCollaborators.has(documentId)) {
    const collaborators = Array.from(activeCollaborators.get(documentId).values());
    
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'COLLABORATORS_UPDATE',
          payload: {
            documentId,
            collaborators
          }
        }));
      }
    });
  }
}

// Helper function to generate random color
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#98D8C8',
    '#F38181', '#A3D9FF', '#FFAAA5', '#B5EAD7', '#C7CEEA'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;