import http from 'http';

function checkServer(url = 'http://localhost:3000') {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🔍 Проверка сервера приложения...');
  
  const isRunning = await checkServer();
  
  if (isRunning) {
    console.log('✅ Сервер запущен на http://localhost:3000');
    process.exit(0);
  } else {
    console.log('❌ Сервер не запущен на http://localhost:3000');
    console.log('');
    console.log('💡 Для запуска E2E тестов выполните:');
    console.log('   1. npm run dev  (в отдельном терминале)');
    console.log('   2. npm run test:e2e');
    console.log('');
    console.log('🔄 Или используйте автоматический запуск:');
    console.log('   npx playwright test (автоматически запустит сервер)');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkServer };