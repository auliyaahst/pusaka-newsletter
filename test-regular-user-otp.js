// Test OTP for non-pusaka.com email
async function testRegularUserOTP() {
  console.log('🧪 Testing regular user OTP requirement...\n')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ahnyjn193@gmail.com',
        password: 'test123',
        type: 'login'
      })
    })
    
    const result = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`📝 Response: ${JSON.stringify(result, null, 2)}`)
    
    if (response.ok && result.success) {
      if (result.skipOTP) {
        console.log('❌ FAILED: OTP was skipped but should be required for non-@pusaka.com email')
      } else {
        console.log('✅ SUCCESS: OTP correctly required for non-@pusaka.com email')
        console.log('📱 OTP sent to email as expected')
      }
    } else {
      console.log(`❌ FAILED: ${result.error}`)
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testRegularUserOTP()
