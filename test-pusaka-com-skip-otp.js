// Test OTP skip functionality for @pusaka.com emails
async function testPusakaComOTPSkip() {
  console.log('🧪 Testing @pusaka.com OTP skip functionality...\n')
  
  const testCases = [
    {
      name: 'Admin @pusaka.com (should skip OTP)',
      email: 'admin@pusaka.com',
      password: 'admin123',
      shouldSkipOTP: true
    },
    {
      name: 'Editor @pusaka.com (should skip OTP)', 
      email: 'editor@pusaka.com',
      password: 'editor123',
      shouldSkipOTP: true
    },
    {
      name: 'Publisher @pusaka.com (should skip OTP)',
      email: 'publisher@pusaka.com', 
      password: 'publisher123',
      shouldSkipOTP: true
    },
    {
      name: 'Regular user (should require OTP)',
      email: 'customer@gmail.com',
      password: 'customer123', 
      shouldSkipOTP: false
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`)
    console.log(`📧 Email: ${testCase.email}`)
    console.log(`🔑 Expected skipOTP: ${testCase.shouldSkipOTP}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testCase.email,
          password: testCase.password,
          type: 'login'
        })
      })
      
      const result = await response.json()
      
      console.log(`📊 Status: ${response.status}`)
      console.log(`📝 Response: ${JSON.stringify(result, null, 2)}`)
      
      if (response.ok && result.success) {
        const actualSkipOTP = result.skipOTP || false
        
        if (actualSkipOTP === testCase.shouldSkipOTP) {
          console.log(`✅ SUCCESS: OTP skip behavior matches expectation`)
          if (actualSkipOTP) {
            console.log(`⚡ OTP was correctly skipped for @pusaka.com email`)
          } else {
            console.log(`📱 OTP was correctly required for regular email`)
          }
        } else {
          console.log(`❌ FAILED: Expected skipOTP=${testCase.shouldSkipOTP}, got skipOTP=${actualSkipOTP}`)
        }
      } else {
        console.log(`❌ FAILED: ${result.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error(`💥 Test failed with error:`, error.message)
    }
    
    console.log('─'.repeat(60))
  }
  
  console.log('\n🎯 Test Summary:')
  console.log('✅ @pusaka.com emails should skip OTP verification')
  console.log('📱 Other emails should require OTP verification')
  console.log('🔐 Password validation still applies to all emails')
}

testPusakaComOTPSkip()
