import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has already used trial
    if (user.trialUsed) {
      return NextResponse.json(
        { error: 'Free trial already used' },
        { status: 400 }
      );
    }

    // Calculate trial end date (3 months from now)
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 3);

    // Update user with trial information
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionType: 'FREE_TRIAL',
        subscriptionStart: trialStart,
        subscriptionEnd: trialEnd,
        trialUsed: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Free trial started successfully',
      trialEnd: trialEnd.toISOString(),
      user: {
        id: updatedUser.id,
        subscriptionType: updatedUser.subscriptionType,
        subscriptionEnd: updatedUser.subscriptionEnd,
      }
    });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
