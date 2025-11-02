// Test all creation endpoints with enhanced logging
async function testCreationEndpointsLogging() {
  console.log('🧪 Testing creation endpoints with enhanced logging...\n')

  // Test 1: Login with @pusaka.com email to get session
  console.log('='.repeat(60))
  console.log('📧 Step 1: Testing login with @pusaka.com email')
  console.log('='.repeat(60))
  
  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'publisher@pusaka.com',
        password: 'publisher123',
        type: 'login'
      })
    })
    
    const loginResult = await loginResponse.json()
    console.log('🔐 Login result:', loginResult)
    
    if (loginResult.skipOTP) {
      console.log('✅ OTP skipped as expected for @pusaka.com email')
    } else {
      console.log('❌ Expected OTP to be skipped')
    }
    
  } catch (error) {
    console.error('💥 Login test failed:', error.message)
  }

  // Test 2: Create a new edition (will likely fail due to auth, but should show detailed logs)
  console.log('\n' + '='.repeat(60))
  console.log('📚 Step 2: Testing edition creation (expecting 403 due to auth)')
  console.log('='.repeat(60))
  
  try {
    const editionResponse = await fetch('http://localhost:3000/api/publisher/editions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Edition ' + Date.now(),
        description: 'Test edition created via API',
        publishDate: new Date().toISOString().split('T')[0],
        editionNumber: Math.floor(Math.random() * 1000),
        theme: 'Technology'
      })
    })
    
    const editionResult = await editionResponse.json()
    console.log(`📊 Edition creation status: ${editionResponse.status}`)
    console.log('📝 Edition creation result:', editionResult)
    
    if (editionResponse.status === 403) {
      console.log('⚠️  Expected 403 - detailed auth logs should appear above')
    } else if (editionResponse.status === 201) {
      console.log('✅ Edition created successfully!')
    }
    
  } catch (error) {
    console.error('💥 Edition creation test failed:', error.message)
  }

  // Test 3: Create a new article (will likely fail due to auth, but should show detailed logs)
  console.log('\n' + '='.repeat(60))
  console.log('📝 Step 3: Testing article creation (expecting 403 due to auth)')
  console.log('='.repeat(60))
  
  try {
    const articleResponse = await fetch('http://localhost:3000/api/editorial/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Article ' + Date.now(),
        content: 'This is a test article created via API with enhanced logging.',
        excerpt: 'Test article excerpt',
        slug: 'test-article-' + Date.now(),
        status: 'DRAFT'
      })
    })
    
    const articleResult = await articleResponse.json()
    console.log(`📊 Article creation status: ${articleResponse.status}`)
    console.log('📝 Article creation result:', articleResult)
    
    if (articleResponse.status === 403) {
      console.log('⚠️  Expected 403 - detailed auth logs should appear above')
    } else if (articleResponse.status === 201) {
      console.log('✅ Article created successfully!')
    }
    
  } catch (error) {
    console.error('💥 Article creation test failed:', error.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎯 Test Summary')
  console.log('='.repeat(60))
  console.log('✅ Enhanced logging has been added to:')
  console.log('   - /api/auth/send-otp (OTP generation & auth)')
  console.log('   - /api/publisher/editions (Publisher edition creation)')
  console.log('   - /api/editorial/articles (Editorial article creation)')
  console.log('   - /api/editorial/editions (Editorial edition creation)')
  console.log('   - NextAuth callbacks (JWT & session handling)')
  console.log('\n📊 Check your server console for detailed logs!')
  console.log('🔍 Look for emojis: 🚀 📧 👤 ✅ ❌ 💾 📝 🔐 etc.')
}

testCreationEndpointsLogging()
