class CommentWebSocketHandler {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected to comment system:', socket.id);
      
      // Join blog post room for real-time comments
      socket.on('join:post', (postId) => {
        socket.join(`post:${postId}`);
        console.log(`User ${socket.id} joined post room: ${postId}`);
      });
      
      // Leave blog post room
      socket.on('leave:post', (postId) => {
        socket.leave(`post:${postId}`);
        console.log(`User ${socket.id} left post room: ${postId}`);
      });
      
      // Join user's personal room for notifications
      socket.on('join:user', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${socket.id} joined user room: ${userId}`);
      });
      
      // Leave user room
      socket.on('leave:user', (userId) => {
        socket.leave(`user:${userId}`);
        console.log(`User ${socket.id} left user room: ${userId}`);
      });
      
      // Real-time typing indicator
      socket.on('comment:typing', (data) => {
        socket.to(`post:${data.postId}`).emit('comment:typing', {
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping
        });
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected from comment system:', socket.id);
      });
    });
  }
  
  // Emit new comment to all users in post room
  emitNewComment(postId, comment) {
    this.io.to(`post:${postId}`).emit('comment:new', comment);
    console.log(`New comment emitted to post room: ${postId}`);
  }
  
  // Emit comment update
  emitCommentUpdate(postId, comment) {
    this.io.to(`post:${postId}`).emit('comment:updated', comment);
    console.log(`Comment update emitted to post room: ${postId}`);
  }
  
  // Emit comment deletion
  emitCommentDelete(postId, commentId) {
    this.io.to(`post:${postId}`).emit('comment:deleted', { commentId });
    console.log(`Comment deletion emitted to post room: ${postId}`);
  }
  
  // Emit reaction update
  emitReactionUpdate(postId, commentId, reactions) {
    this.io.to(`post:${postId}`).emit('comment:reaction', { 
      commentId, 
      reactions 
    });
    console.log(`Reaction update emitted to post room: ${postId}`);
  }
  
  // Notify user when someone replies to their comment
  notifyCommentReply(userId, data) {
    this.io.to(`user:${userId}`).emit('comment:reply', data);
    console.log(`Reply notification sent to user: ${userId}`);
  }
  
  // Notify user when someone reacts to their comment
  notifyCommentReaction(userId, data) {
    this.io.to(`user:${userId}`).emit('comment:reaction', data);
    console.log(`Reaction notification sent to user: ${userId}`);
  }
  
  // Send new notification to user
  sendNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification:new', notification);
    console.log(`New notification sent to user: ${userId}`);
  }
}

module.exports = CommentWebSocketHandler;