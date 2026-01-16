// Load test for app analytics endpoints (not plugin analytics)
import { performance } from 'perf_hooks';

async function testAnalyticsLoadTest() {
  const start = performance.now();
  
  // Simulate multiple concurrent tracking requests
  const promises = Array(100).fill(null).map((_, i) => {
    return new Promise(resolve => {
      // Simulate async operation
      setTimeout(() => {
        resolve({
          sessionId: `perf-test-${i}`,
          pagePath: `/test-page-${i}`,
          pageTitle: `Performance Test ${i}`,
          status: 'success'
        });
      }, Math.random() * 10);
    });
  });
  
  const results = await Promise.all(promises);
  const end = performance.now();
  
  console.log(`Analytics load test completed in ${end - start}ms`);
  console.log(`Processed ${results.length} requests`);
  console.log(`Average time per request: ${(end - start) / results.length}ms`);
}

testAnalyticsLoadTest().catch(console.error);

export { testAnalyticsLoadTest };