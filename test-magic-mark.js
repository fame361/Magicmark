/**
 * Magic Mark - Comprehensive Test Suite
 * Tests Bookmark Management and Admin API
 * 
 * Usage: node test-magic-mark.js
 * 
 * Reads credentials from Strapi ENV variables or .env file
 */

// Try to load .env file if available from multiple paths
const path = require('path');
try {
  // Try paths in order of priority
  const possiblePaths = [
    '../../../.env',        // From magic-mark plugin to magic-link-dev root (correct path)
    '../../.env',           // Alternative path  
    '.env',                 // Current directory
  ];
  
  let loaded = false;
  for (const envPath of possiblePaths) {
    try {
      require('dotenv').config({ path: envPath });
      loaded = true;
      console.log(`✓ Loaded .env from: ${envPath}`);
      break;
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (!loaded) {
    console.log('ℹ️  No .env file found, using environment variables');
  }
} catch (err) {
  // dotenv not installed - that's ok, use ENV vars
  console.log('ℹ️  Using environment variables (dotenv not available)');
}

const BASE_URL = process.env.STRAPI_URL || process.env.BASE_URL || 'http://localhost:1337';

// Test Credentials - Try multiple possible environment variable names
const ADMIN_CREDENTIALS = {
  // Try different variable name patterns - same as magic-link test
  email: process.env.ADMIN_EMAIL || 
         process.env.STRAPI_ADMIN_EMAIL || 
         process.env.STRAPI_ADMIN || 
         process.env.ADMIN_USERNAME ||
         process.env.ADMIN,
  password: (process.env.ADMIN_PASSWORD || 
            process.env.STRAPI_ADMIN_PASSWORD || 
            process.env.STRAPI_ADMIN_PASS ||
            process.env.ADMIN_PASS ||
            process.env.ADMIN_PWD || '').replace(/^['"]|['"]$/g, '')  // Remove quotes if present
};

// Debug Mode (shows more details) - Moved before usage
const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

// Debug: Show all environment variables (for debugging)
if (DEBUG || !ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  console.log('\n📋 Available environment variables:');
  const relevantVars = Object.keys(process.env).filter(key => 
    !key.startsWith('_') && 
    !key.includes('PATH') && 
    !key.includes('TERM') &&
    !key.includes('SHELL') &&
    !key.includes('HOME') &&
    !key.includes('USER') &&
    !key.includes('LOGNAME') &&
    !key.includes('TMPDIR') &&
    !key.includes('LaunchAgents')
  );
  if (relevantVars.length > 0) {
    relevantVars.slice(0, 20).forEach(key => {
      const value = (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY')) 
        ? '***' 
        : process.env[key]?.substring(0, 50);
      console.log(`  • ${key}: ${value}`);
    });
  } else {
    console.log('  (No relevant environment variables found)');
  }
  console.log('');
}

// Show what we're using
console.log('ℹ️  Using admin email:', ADMIN_CREDENTIALS.email || 'NOT SET');

// Validate credentials are provided
if (!ADMIN_CREDENTIALS.email || !ADMIN_CREDENTIALS.password) {
  console.error('\n❌ ERROR: Missing admin credentials');
  console.error('━'.repeat(70));
  console.error('Could not find admin credentials in environment variables.');
  console.error('');
  console.error('Tried these variable names:');
  console.error('  • ADMIN_EMAIL or STRAPI_ADMIN_EMAIL');
  console.error('  • ADMIN_PASSWORD or STRAPI_ADMIN_PASSWORD');
  console.error('');
  console.error('Current environment variables:');
  const envVars = Object.keys(process.env).filter(key => 
    key.includes('ADMIN') || key.includes('EMAIL') || key.includes('PASSWORD')
  );
  if (envVars.length > 0) {
    envVars.forEach(key => {
      const value = key.includes('PASSWORD') || key.includes('PASS') ? '***' : process.env[key];
      console.error(`  • ${key}: ${value}`);
    });
  } else {
    console.error('  (No admin-related variables found)');
  }
  console.error('');
  console.error('Options:');
  console.error('  1. Add to your .env file with correct variable names');
  console.error('  2. Pass on command line:');
  console.error('     ADMIN_EMAIL=admin@example.com \\');
  console.error('     ADMIN_PASSWORD=password \\');
  console.error('     node test-magic-mark.js');
  console.error('━'.repeat(70) + '\n');
  process.exit(1);
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test Results
const results = {
  passed: 0, 
  failed: 0, 
  skipped: 0
};

// Store test data
let ADMIN_JWT = null;
let BOOKMARK_ID = null;
let USER_ID = null;
let ROLES_LIST = [];
let USERS_LIST = [];

// Helper Functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
  results.passed++;
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
  results.failed++;
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
  results.skipped++;
}

function logSection(message) {
  log(`\n${'='.repeat(70)}`, colors.magenta);
  log(`  ${message}`, colors.magenta);
  log(`${'='.repeat(70)}`, colors.magenta);
}

function logCategory(message) {
  log(`\n${'▓'.repeat(70)}`, colors.cyan);
  log(`  ${message}`, `${colors.cyan}${colors.bold}`);
  log(`${'▓'.repeat(70)}\n`, colors.cyan);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

/**
 * Admin Login - Required for all tests
 */
async function adminLogin() {
  logSection('AUTHENTICATION: Admin Panel Login');
  
  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });

    const data = await response.json();

    if (response.ok && data.data?.token) {
      ADMIN_JWT = data.data.token;
      USER_ID = data.data.user.id;
      logSuccess(`Admin login successful for ${data.data.user.email}`);
      logInfo(`Admin JWT: ${ADMIN_JWT.substring(0, 40)}...`);
      logInfo(`User ID: ${USER_ID}`);
      return true;
    } else {
      logError(`Admin login failed: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    logError(`Admin login error: ${err.message}`);
    return false;
  }
}

// ============================================================
// BOOKMARK TESTS
// ============================================================

/**
 * TEST 1: Get Available Roles
 */
async function testGetRoles() {
  logSection('TEST 1: Get Available Roles for Sharing');
  
  try {
    const response = await fetch(`${BASE_URL}/magic-mark/roles`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });

    const data = await response.json();

    if (DEBUG) {
      logInfo(`Debug: Roles response status: ${response.status}`);
      logInfo(`Debug: Roles response data: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    if (response.ok) {
      // Handle nested data structure { data: { data: [...] } }
      ROLES_LIST = data.data?.data || data.data || data.roles || data || [];
      
      if (Array.isArray(ROLES_LIST)) {
        logSuccess(`Retrieved ${ROLES_LIST.length} roles`);
        ROLES_LIST.forEach(role => {
          logInfo(`  • ${role.name} (ID: ${role.id})`);
        });
        return true;
      } else {
        logError(`Unexpected roles response format: ${typeof ROLES_LIST}`);
        logInfo(`Response data: ${JSON.stringify(ROLES_LIST).substring(0, 200)}`);
        ROLES_LIST = [];
        return false;
      }
    } else {
      logError(`Get roles failed: ${response.status} - ${data.error?.message || data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    logError(`Get roles error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 2: Get Available Users
 */
async function testGetUsers() {
  logSection('TEST 2: Get Available Users for Sharing');
  
  try {
    const response = await fetch(`${BASE_URL}/magic-mark/users`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });

    const data = await response.json();

    if (DEBUG) {
      logInfo(`Debug: Users response status: ${response.status}`);
      logInfo(`Debug: Users response data: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    if (response.ok) {
      // Handle nested data structure { data: { data: [...] } }
      USERS_LIST = data.data?.data || data.data || data.users || data || [];
      
      if (Array.isArray(USERS_LIST)) {
        logSuccess(`Retrieved ${USERS_LIST.length} users`);
        if (USERS_LIST.length > 0) {
          logInfo(`Sample users: ${USERS_LIST.slice(0, 3).map(u => u.email || u.username).join(', ')}`);
        }
        return true;
      } else {
        logError(`Unexpected users response format: ${typeof USERS_LIST}`);
        logInfo(`Response data: ${JSON.stringify(USERS_LIST).substring(0, 200)}`);
        USERS_LIST = [];
        return false;
      }
    } else {
      logError(`Get users failed: ${response.status} - ${data.error?.message || data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    logError(`Get users error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 3: Create Bookmark
 */
async function testCreateBookmark() {
  logSection('TEST 3: Create a New Bookmark');
  
  try {
    // Use a more generic path that's likely to exist
    // IMPORTANT: query must be a URL query string, NOT an object!
    const bookmarkData = {
      name: 'Test Bookmark - Admin Users',
      path: '/content-manager/collection-types/admin::user',  // Admin users usually exist
      query: 'page=1&pageSize=10&sort=createdAt:desc',  // Must be a STRING, not object
      emoji: '📚',
      description: 'Test bookmark for admin users',
      isPublic: false,
      sharedWithRoles: ROLES_LIST.length > 0 ? [ROLES_LIST[0].id] : [],
      sharedWithUsers: []
    };
    
    // Alternative paths to try if first fails
    const alternativePaths = [
      '/content-manager/collection-types/admin::user',
      '/content-manager/collection-types/plugin::users-permissions.user',
      '/content-manager/single-types/admin::general-settings',
      '/admin/settings'
    ];

    if (DEBUG) {
      logInfo(`Debug: Creating bookmark with data: ${JSON.stringify(bookmarkData, null, 2)}`);
    }

    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarkData),
    });

    const data = await response.json();

    if (DEBUG) {
      logInfo(`Debug: Create bookmark response status: ${response.status}`);
      logInfo(`Debug: Create bookmark response: ${JSON.stringify(data).substring(0, 400)}`);
    }
    
    if (response.ok && data.data) {
      BOOKMARK_ID = data.data.id;
      logSuccess(`Bookmark created successfully`);
      logInfo(`Bookmark ID: ${BOOKMARK_ID}`);
      logInfo(`Name: ${data.data.name}`);
      logInfo(`Emoji: ${data.data.emoji}`);
      logInfo(`Path: ${data.data.path}`);
      return true;
    } else {
      const errorDetails = data.error || data;
      const errorMsg = errorDetails.message || errorDetails.details || JSON.stringify(errorDetails).substring(0, 400);
      
      // Specific error handling
      if (response.status === 500) {
        logError(`Internal Server Error creating bookmark`);
        logInfo(`💡 Possible causes:`);
        logInfo(`  • Plugin not properly initialized`);
        logInfo(`  • Database schema issue`);
        logInfo(`  • Content-type path doesn't exist`);
        logInfo(`Error details: ${errorMsg}`);
      } else if (response.status === 400) {
        logError(`Bad Request: ${errorMsg}`);
      } else {
        logError(`Create bookmark failed (${response.status}): ${errorMsg}`);
      }
      return false;
    }
  } catch (err) {
    logError(`Create bookmark error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 4: Get All Bookmarks
 */
async function testGetAllBookmarks() {
  logSection('TEST 4: Get All Bookmarks');
  
  try {
    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });

    const data = await response.json();

    if (response.ok && data.data) {
      const bookmarks = data.data;
      logSuccess(`Retrieved ${bookmarks.length} bookmarks`);
      
      if (bookmarks.length > 0) {
        const pinned = bookmarks.filter(b => b.isPinned).length;
        const public = bookmarks.filter(b => b.isPublic).length;
        const shared = bookmarks.filter(b => (b.sharedWithRoles?.length > 0) || (b.sharedWithUsers?.length > 0)).length;
        
        logInfo(`  📌 Pinned: ${pinned}`);
        logInfo(`  🌍 Public: ${public}`);
        logInfo(`  👥 Shared: ${shared}`);
        logInfo(`  🔒 Private: ${bookmarks.length - public - shared}`);
        
        // Show first bookmark details
        const first = bookmarks[0];
        if (first) {
          logInfo(`Sample bookmark: ${first.emoji} ${first.name} (ID: ${first.id})`);
        }
      }
      
      return true;
    } else {
      logError(`Get bookmarks failed: ${response.status}`);
      return false;
    }
  } catch (err) {
    logError(`Get bookmarks error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 5: Update Bookmark
 */
async function testUpdateBookmark() {
  logSection('TEST 5: Update Existing Bookmark');
  
  if (!BOOKMARK_ID) {
    logWarning('No bookmark ID available, skipping update test');
    return null;
  }
  
  try {
    const updateData = {
      name: 'Updated Bookmark - Recent Articles',
      emoji: '🔥',
      description: 'Updated description - Shows recent articles',
      path: '/content-manager/collection-types/admin::user',  // Required field
      query: 'page=1&pageSize=20&sort=updatedAt:desc',  // Must be a string
      isPinned: true,
      isPublic: true
    };

    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks/${BOOKMARK_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (DEBUG) {
      logInfo(`Debug: Update response status: ${response.status}`);
      logInfo(`Debug: Update response: ${JSON.stringify(data).substring(0, 400)}`);
    }
    
    if (response.ok && data.data) {
      logSuccess(`Bookmark updated successfully`);
      logInfo(`Name: ${data.data.name}`);
      logInfo(`Pinned: ${data.data.isPinned}`);
      logInfo(`Public: ${data.data.isPublic}`);
      return true;
    } else {
      const errorMsg = data.error?.message || data.message || JSON.stringify(data).substring(0, 400);
      logError(`Update bookmark failed (${response.status}): ${errorMsg}`);
      return false;
    }
  } catch (err) {
    logError(`Update bookmark error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 6: Pin/Unpin Bookmark
 */
async function testPinBookmark() {
  logSection('TEST 6: Toggle Pin Status');
  
  if (!BOOKMARK_ID) {
    logWarning('No bookmark ID available, skipping pin test');
    return null;
  }
  
  try {
    // Toggle to pinned (true)
    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks/${BOOKMARK_ID}/pin`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isPinned: true })
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess(`Bookmark pin status toggled`);
      logInfo(`Pinned: ${data.data?.isPinned}`);
      return true;
    } else {
      logError(`Pin bookmark failed: ${response.status}`);
      return false;
    }
  } catch (err) {
    logError(`Pin bookmark error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 7: Reorder Bookmarks
 */
async function testReorderBookmarks() {
  logSection('TEST 7: Reorder Bookmarks (Drag & Drop Simulation)');
  
  try {
    // First get all bookmarks
    const getResponse = await fetch(`${BASE_URL}/magic-mark/bookmarks`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });
    
    const bookmarks = (await getResponse.json()).data || [];
    
    if (bookmarks.length < 2) {
      logWarning('Not enough bookmarks to test reordering (need at least 2)');
      return null;
    }
    
    // Create new order (reverse the first two)
    const orderedIds = bookmarks.map(b => b.id);
    if (orderedIds.length >= 2) {
      [orderedIds[0], orderedIds[1]] = [orderedIds[1], orderedIds[0]];
    }
    
    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks/reorder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookmarkIds: orderedIds }),
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess(`Bookmarks reordered successfully`);
      logInfo(`Reordered ${orderedIds.length} bookmarks`);
      return true;
    } else {
      logError(`Reorder failed: ${response.status}`);
      return false;
    }
  } catch (err) {
    logError(`Reorder error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 8: Create Multiple Test Bookmarks
 */
async function testCreateMultipleBookmarks() {
  logSection('TEST 8: Create Multiple Test Bookmarks');
  
  const testBookmarks = [
    {
      name: 'Draft Content',
      emoji: '📝',
      description: 'All unpublished drafts',
      query: 'filters[publishedAt][$null]=true'  // Query as URL string
    },
    {
      name: 'Recent Updates',
      emoji: '🔄',
      description: 'Updated in last 7 days',
      query: 'sort=updatedAt:desc'  // Query as URL string
    },
    {
      name: 'My Content',
      emoji: '👤',
      description: 'Content created by me',
      query: `filters[createdBy][id]=${USER_ID}`  // Query as URL string
    }
  ];
  
  let successCount = 0;
  
  for (const bookmark of testBookmarks) {
    try {
      const response = await fetch(`${BASE_URL}/magic-mark/bookmarks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_JWT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookmark,
          path: '/content-manager/collection-types/plugin::users-permissions.user',  // Use users collection
        }),
      });

      if (response.ok) {
        successCount++;
        logInfo(`  ✓ Created: ${bookmark.emoji} ${bookmark.name}`);
      } else {
        logInfo(`  ✗ Failed: ${bookmark.name}`);
      }
      
      await sleep(200); // Small delay between creations
    } catch (err) {
      logInfo(`  ✗ Error creating ${bookmark.name}: ${err.message}`);
    }
  }
  
  if (successCount > 0) {
    logSuccess(`Created ${successCount}/${testBookmarks.length} test bookmarks`);
    return true;
  } else {
    logError('Failed to create any test bookmarks');
    return false;
  }
}

/**
 * TEST 9: License Status
 */
async function testLicenseStatus() {
  logSection('TEST 9: Check License Status');
  
  try {
    const response = await fetch(`${BASE_URL}/magic-mark/license/status`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess('License status retrieved');
      logInfo(`Valid: ${data.valid}`);
      logInfo(`Demo: ${data.demo}`);
      
      if (data.data) {
        logInfo(`License Key: ${data.data.licenseKey?.substring(0, 20)}...`);
        logInfo(`Email: ${data.data.email || 'N/A'}`);
      }
      
      return true;
    } else {
      logWarning(`License status check failed: ${response.status}`);
      return null;
    }
  } catch (err) {
    logError(`License status error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 10: Delete Bookmark
 */
async function testDeleteBookmark() {
  logSection('TEST 10: Delete Bookmark');
  
  if (!BOOKMARK_ID) {
    logWarning('No bookmark ID available, skipping delete test');
    return null;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/magic-mark/bookmarks/${BOOKMARK_ID}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });

    const data = await response.json();

    if (response.ok) {
      logSuccess(`Bookmark ${BOOKMARK_ID} deleted successfully`);
      BOOKMARK_ID = null; // Clear the ID
      return true;
    } else {
      logError(`Delete bookmark failed: ${response.status}`);
      return false;
    }
  } catch (err) {
    logError(`Delete bookmark error: ${err.message}`);
    return false;
  }
}

/**
 * TEST 11: License Auto-Create
 */
async function testLicenseAutoCreate() {
  logSection('TEST 11: License Auto-Create (if needed)');
  
  try {
    // First check status
    const statusResponse = await fetch(`${BASE_URL}/magic-mark/license/status`, {
      headers: { 'Authorization': `Bearer ${ADMIN_JWT}` },
    });
    
    const status = await statusResponse.json();
    
    if (status.valid) {
      logInfo('License already valid, skipping auto-create');
      return true;
    }
    
    // Try auto-create
    const response = await fetch(`${BASE_URL}/magic-mark/license/auto-create`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${ADMIN_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess('License auto-created successfully');
      logInfo(`License Key: ${data.data?.licenseKey?.substring(0, 20)}...`);
      return true;
    } else {
      logWarning('License auto-create not needed or failed');
      return null;
    }
  } catch (err) {
    logWarning(`License auto-create: ${err.message}`);
    return null;
  }
}

/**
 * SUMMARY: Print Test Results
 */
function printSummary() {
  logSection('TEST SUMMARY');
  
  const total = results.passed + results.failed + results.skipped;
  const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  
  console.log('');
  log('MAGIC MARK TEST RESULTS:', `${colors.cyan}${colors.bold}`);
  log(`  Total Tests:  ${total}`, colors.cyan);
  log(`  ✅ Passed:     ${results.passed}`, colors.green);
  log(`  ❌ Failed:     ${results.failed}`, colors.red);
  log(`  ⚠️  Skipped:    ${results.skipped}`, colors.yellow);
  log(`  Pass Rate:    ${passRate}%`, passRate >= 80 ? colors.green : passRate >= 60 ? colors.yellow : colors.red);
  console.log('');
  
  if (results.failed === 0) {
    log('🎉 ALL TESTS PASSED!', colors.green);
  } else {
    log(`⚠️  ${results.failed} test(s) failed`, colors.red);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
}

/**
 * MAIN: Run All Tests
 */
async function runAllTests() {
  log('\n' + '█'.repeat(70), colors.magenta);
  log('  MAGIC MARK - COMPREHENSIVE TEST SUITE', `${colors.magenta}${colors.bold}`);
  log('  Query Builder & Bookmark Manager for Strapi v5', colors.magenta);
  log('█'.repeat(70) + '\n', colors.magenta);
  
  logInfo(`Base URL: ${BASE_URL}`);
  logInfo(`Admin Email: ${ADMIN_CREDENTIALS.email}`);
  console.log('');
  
  // ============================================================
  // AUTHENTICATION
  // ============================================================
  const loginSuccess = await adminLogin();
  if (!loginSuccess) {
    logError('Cannot continue without admin authentication');
    process.exit(1);
  }
  await sleep(500);
  
  // ============================================================
  // BOOKMARK TESTS
  // ============================================================
  logCategory('BOOKMARK MANAGEMENT TESTS');
  
  // Test 1: Get roles for sharing
  await testGetRoles();
  await sleep(300);
  
  // Test 2: Get users for sharing  
  await testGetUsers();
  await sleep(300);
  
  // Test 3: Create bookmark
  await testCreateBookmark();
  await sleep(300);
  
  // Test 4: Get all bookmarks
  await testGetAllBookmarks();
  await sleep(300);
  
  // Test 5: Update bookmark
  await testUpdateBookmark();
  await sleep(300);
  
  // Test 6: Pin/unpin bookmark
  await testPinBookmark();
  await sleep(300);
  
  // Test 7: Reorder bookmarks
  await testReorderBookmarks();
  await sleep(300);
  
  // Test 8: Create multiple bookmarks
  await testCreateMultipleBookmarks();
  await sleep(300);
  
  // Test 9: License status
  await testLicenseStatus();
  await sleep(300);
  
  // Test 10: Delete bookmark (cleanup)
  await testDeleteBookmark();
  await sleep(300);
  
  // Test 11: License auto-create (if needed)
  await testLicenseAutoCreate();
  await sleep(300);
  
  // Print Summary
  printSummary();
  
  // Exit with proper code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  logError(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
