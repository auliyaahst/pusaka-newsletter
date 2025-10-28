// Debug OTP sending issue
async function testOTPSending() {
  console.log('🧪 Testing OTP sending with debug info...\n')
  
  const testData = {
    email: 'customer@pusaka.com',
    password: 'customer123',
    type: 'login'
  }
  
  try {
    console.log('📧 Testing with email:', testData.email)
    console.log('🔑 Password provided:', testData.password ? 'Yes' : 'No')
    console.log('📝 Type:', testData.type)
    
    const response = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('\n📥 Response Status:', response.status)
    console.log('📝 Response Data:', JSON.stringify(result, null, 2))
    
    if (response.ok && result.success) {
      console.log('\n🎉 SUCCESS! OTP should be sent to email')
      if (result.skipOTP) {
        console.log('⚠️  OTP was skipped for this email (admin/staff account)')
      }
    } else {
      console.log('\n❌ FAILED! OTP sending unsuccessful')
      console.log('Error:', result.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message)
  }
}

testOTPSending()
