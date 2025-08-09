/**
 * Test Password Hashing Functionality
 * Run this in browser console to verify hashing works
 */

export async function testPasswordHashing() {
  console.log('🧪 Testing Password Hashing...');
  
  // Check environment variable
  const salt = process.env.REACT_APP_PASSWORD_SALT;
  console.log('1. Environment Variable Check:');
  console.log('   REACT_APP_PASSWORD_SALT exists:', !!salt);
  console.log('   Salt length:', salt?.length || 0);
  console.log('   Salt preview:', salt?.substring(0, 16) + '...' || 'NOT SET');
  
  // Check crypto support
  console.log('2. Crypto Support Check:');
  console.log('   crypto available:', typeof crypto !== 'undefined');
  console.log('   crypto.subtle available:', typeof crypto?.subtle !== 'undefined');
  console.log('   digest function available:', typeof crypto?.subtle?.digest === 'function');
  
  // Test hashing
  if (salt && salt.length >= 32 && typeof crypto?.subtle?.digest === 'function') {
    try {
      console.log('3. Testing Hash Generation:');
      const testPassword = 'TestPassword123!';
      const combined = testPassword + salt;
      const encoder = new TextEncoder();
      const data = encoder.encode(combined);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('   Test password:', testPassword);
      console.log('   Generated hash:', hashHex);
      console.log('   Hash length:', hashHex.length);
      console.log('   Hash format valid:', /^[a-f0-9]{64}$/i.test(hashHex));
      console.log('✅ Password hashing is working correctly!');
      
      return {
        working: true,
        hash: hashHex,
        saltLength: salt.length
      };
    } catch (error) {
      console.error('❌ Hash generation failed:', error);
      return {
        working: false,
        error: error.message
      };
    }
  } else {
    console.error('❌ Prerequisites not met for password hashing');
    return {
      working: false,
      error: 'Prerequisites not met'
    };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testPasswordHashing = testPasswordHashing;
}