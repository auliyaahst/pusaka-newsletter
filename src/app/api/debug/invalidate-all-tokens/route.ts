import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔄 Forcing session invalidation timestamp...')
  
  // Set a global session invalidation timestamp in environment
  // Any JWT created before this time should be considered invalid
  const invalidationTime = Date.now()
  
  // Store this in a simple file or database record
  const fs = require('node:fs')
  const path = require('node:path')
  
  const invalidationFile = path.join(process.cwd(), '.session-invalidation')
  fs.writeFileSync(invalidationFile, invalidationTime.toString())
  
  console.log(`📅 Session invalidation timestamp set to: ${new Date(invalidationTime)}`)
  
  return NextResponse.json({
    success: true,
    message: 'Global session invalidation timestamp set',
    timestamp: invalidationTime,
    time: new Date(invalidationTime).toISOString()
  })
}
