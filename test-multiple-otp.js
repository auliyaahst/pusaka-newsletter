// Test multiple scenarios for OTP sending
async function testMultipleScenarios() {
  console.log('🧪 Testing multiple OTP scenarios...\n')
  
  const testCases = [
    {
      name: 'Admin Email (should skip OTP)',
      data: { email: 'admin@pusaka.com', password: 'admin123', type: 'login' }
    },
    {
      name: 'Regular Customer (should send OTP)',
      data: { email: 'customer@pusaka.com', password: 'customer123', type: 'login' }
    },
    {
      name: 'Non-existent User',
      data: { email: 'nonexistent@test.com', password: 'test123', type: 'login' }
    },
    {
      name: 'Missing Password',
      data: { email: 'customer@pusaka.com', type: 'login' }
    },
    {
      name: 'Missing Type',
      data: { email: 'customer@pusaka.com', password: 'customer123' }
    },
    {
      name: 'Wrong Password',
      data: { email: 'customer@pusaka.com', password: 'wrongpassword', type: 'login' }
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`)
    console.log('📝 Data:', JSON.stringify(testCase.data, null, 2))
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      })
      
      const result = await response.json()
      
      console.log(`📊 Status: ${response.status}`)
      console.log('📝 Response:', JSON.stringify(result, null, 2))
      
      if (response.status === 400) {
        console.log('⚠️  This scenario causes a 400 error!')
      }
      
    } catch (error) {
      console.error('💥 Error:', error.message)
    }
    
    console.log('─'.repeat(50))
  }
}

testMultipleScenarios()
