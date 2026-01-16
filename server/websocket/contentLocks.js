/**
 * WebSocket Content Locks Handler
 * Real-time collaboration and content locking
 */

const { pool } = require('../db/connection');

/**
 * Handle content locking WebSocket events
 */
const handleContentLocks = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected for documentation collaboration:', socket.id);

    // Join library-specific room
    socket.on('join_library', (data) => {
      const { libraryType, userId, userName } = data;
      const roomName = `documentation_${libraryType}`;
      
      socket.join(roomName);
      socket.libraryType = libraryType;
      socket.userId = userId;
      socket.userName = userName;
      
      console.log(`User ${userName} joined ${roomName}`);
    });

    // Handle content locking
    socket.on('lock_content', async (data) => {
      try {
        const { contentId, userId, userName, libraryType } = data;
        
        // Check if already locked
        const lockCheck = await pool.query(
          'SELECT * FROM is_content_locked($1)',
          [contentId]
        );

        const existingLock = lockCheck.rows[0];
        
        if (existingLock.is_locked && existingLock.locked_by !== userId) {
          socket.emit('lock_failed', {
            contentId,
            error: 'Content is already locked by another user',
            lock: {
              userId: existingLock.locked_by,
              userName: existingLock.locked_by_name,
              expiresAt: existingLock.expires_at
            }
          });
          return;
        }

        // Create lock
        await pool.query(`
          INSERT INTO documentation_content_locks (content_id, user_id, user_name)
          VALUES ($1, $2, $3)
          ON CONFLICT (content_id) 
          DO UPDATE SET 
            user_id = $2, 
            user_name = $3, 
            locked_at = NOW(), 
            expires_at = NOW() + INTERVAL '30 minutes'
        `, [contentId, userId, userName]);

        const lock = {
          id: contentId,
          contentId,
          userId,
          userName,
          lockedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };

        // Notify all users in the library room
        const roomName = `documentation_${libraryType}`;
        socket.to(roomName).emit('content_locked', {
          type: 'content_locked',
          contentId,
          lock
        });

        socket.emit('lock_success', {
          contentId,
          lock
        });

      } catch (error) {
        console.error('Error locking content:', error);
        socket.emit('lock_failed', {
          contentId: data.contentId,
          error: 'Failed to lock content'
        });
      }
    });

    // Handle content unlocking
    socket.on('unlock_content', async (data) => {
      try {
        const { contentId, userId, libraryType } = data;

        // Remove lock
        const result = await pool.query(
          'DELETE FROM documentation_content_locks WHERE content_id = $1 AND user_id = $2',
          [contentId, userId]
        );

        if (result.rowCount > 0) {
          // Notify all users in the library room
          const roomName = `documentation_${libraryType}`;
          socket.to(roomName).emit('content_unlocked', {
            type: 'content_unlocked',
            contentId
          });

          socket.emit('unlock_success', {
            contentId
          });
        }

      } catch (error) {
        console.error('Error unlocking content:', error);
        socket.emit('unlock_failed', {
          contentId: data.contentId,
          error: 'Failed to unlock content'
        });
      }
    });

    // Handle real-time content updates
    socket.on('update_content', async (data) => {
      try {
        const { contentId, content, userId, userName, libraryType } = data;

        // Verify user has lock or is admin
        const lockCheck = await pool.query(
          'SELECT * FROM is_content_locked($1)',
          [contentId]
        );

        const existingLock = lockCheck.rows[0];
        
        if (!existingLock.is_locked || existingLock.locked_by !== userId) {
          socket.emit('update_failed', {
            contentId,
            error: 'You must lock the content before updating'
          });
          return;
        }

        // Broadcast update to other users in the room
        const roomName = `documentation_${libraryType}`;
        socket.to(roomName).emit('content_updated', {
          type: 'content_updated',
          contentId,
          content,
          userId,
          userName,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error updating content:', error);
        socket.emit('update_failed', {
          contentId: data.contentId,
          error: 'Failed to update content'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          // Remove all locks held by this user
          await pool.query(
            'DELETE FROM documentation_content_locks WHERE user_id = $1',
            [socket.userId]
          );

          // Notify room about unlocked content
          if (socket.libraryType) {
            const roomName = `documentation_${socket.libraryType}`;
            socket.to(roomName).emit('user_disconnected', {
              userId: socket.userId,
              userName: socket.userName
            });
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
      
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = { handleContentLocks };