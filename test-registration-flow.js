// Test registration flow with new email
async function testRegistrationFlow() {
  console.log('🧪 Testing Complete Registration Flow...\n')
  
  const testEmail = 'test.user.' + Date.now() + '@gmail.com'
  const testData = {
    name: 'Test User New',
    email: '@gmail.com', // Use your real email to receive OTP
    password: 'testpassword123'
  }
  
  try {
    console.log('Step 1: Creating user account...')
    console.log('📧 Email:', testData.email)
    
    // Step 1: Register user
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const registerResult = await registerResponse.json()
    console.log('✅ Register Response:', registerResponse.status, registerResult)
    
    if (registerResponse.ok) {
      console.log('\nStep 2: Sending OTP for verification...')
      
      // Step 2: Send OTP for verification
      const otpResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testData.email,
          type: 'register'
        })
      })
      
      const otpResult = await otpResponse.json()
      console.log('📧 OTP Response:', otpResponse.status, otpResult)
      
      if (otpResponse.ok && otpResult.success) {
        console.log('\n🎉 SUCCESS! Complete registration flow working!')
        console.log('📬 Check your email for the OTP code')
        console.log('⏰ OTP expires at:', otpResult.expiresAt)
        console.log('\n📝 Next: Enter the OTP code in the UI to complete verification')
      } else {
        console.log('\n❌ OTP sending failed')
        console.log('Error:', otpResult.error)
      }
    } else {
      console.log('\n❌ Registration failed')
      console.log('Error:', registerResult.error)
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message)
  }
}

testRegistrationFlow()
