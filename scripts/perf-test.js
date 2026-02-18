#!/usr/bin/env node

/**
 * Quick Performance Test Script
 * 
 * Run this after making changes to compare performance
 * Usage: node scripts/perf-test.js
 */

console.log('\n🚀 Loan Tracker - Performance Testing Suite\n');
console.log('═══════════════════════════════════════════════\n');

console.log('📊 Available Performance Tests:\n');

console.log('1. Benchmark Tests (Automated Comparison)');
console.log('   Command: npm run test:bench');
console.log('   Output: Performance metrics for old vs new implementations\n');

console.log('2. Interactive Monitoring (Browser Console)');
console.log('   Steps:');
console.log('   - Run: npm run dev');
console.log('   - Open browser DevTools (F12)');
console.log('   - In console: window.__performanceMonitor.getAllStats()\n');

console.log('3. React DevTools Profiler');
console.log('   Steps:');
console.log('   - Install React DevTools extension');
console.log('   - Open DevTools → Profiler tab');
console.log('   - Click record, interact with app, stop recording\n');

console.log('4. Chrome Performance Tab');
console.log('   Steps:');
console.log('   - Open DevTools → Performance tab');
console.log('   - Record session while using the app');
console.log('   - Analyze flamegraph and timings\n');

console.log('═══════════════════════════════════════════════\n');

console.log('💡 Quick Start:\n');
console.log('   npm run test:bench          # Run automated benchmarks');
console.log('   npm run test:bench --ui     # Run with visual UI');
console.log('   npm run dev                 # Start dev server with monitoring\n');

console.log('📖 Full documentation: PERFORMANCE_TESTING.md\n');

// If being run directly
if (require.main === module) {
  const readline = require('readline');
  const { spawn } = require('child_process');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Run benchmark tests now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n🏃 Running benchmarks...\n');
      
      const bench = spawn('npm', ['run', 'test:bench'], {
        stdio: 'inherit',
        shell: true
      });

      bench.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Benchmarks completed successfully!\n');
        } else {
          console.log('\n❌ Benchmarks failed with code', code, '\n');
        }
        rl.close();
      });
    } else {
      console.log('\n👋 Exiting. Run benchmarks anytime with: npm run test:bench\n');
      rl.close();
    }
  });
}
