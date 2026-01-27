🔧 Fix WebSocket connection and prepare for deployment

## WebSocket Fixes
- ✅ Fixed WebSocketProvider import in App.tsx to use correct context
- ✅ Enhanced WebSocket service with debug logging for blog events
- ✅ Updated UI system WebSocketProvider to use full context logic
- ✅ Added proper WebSocket connection URL logging

## Production Configuration
- ✅ Created Nginx configuration with WebSocket support
- ✅ Added CORS headers for static files serving
- ✅ Fixed WebSocket proxy with proper timeouts
- ✅ Added environment variables for production

## Deployment Scripts
- ✅ Created deployment scripts for server setup
- ✅ Added WebSocket and images fix script
- ✅ Created commit script for GitHub

## Issues Fixed
- WebSocket connection to wss://blogpro.tech/ws
- Real-time blog updates on frontend  
- Static images serving from /uploads
- Production deployment configuration

## TODO
- [ ] Find and remove problematic CSS rule: `header { display: flex; ... }`
- [ ] Test WebSocket connection after deployment
- [ ] Verify images loading from /uploads

Ready for deployment to production server.