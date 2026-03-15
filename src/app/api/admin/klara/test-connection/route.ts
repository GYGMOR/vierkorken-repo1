/**
 * Admin KLARA API Test Connection Endpoint
 * Comprehensive testing and diagnosis of KLARA API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized - Admin only' }, { status: 403 });
    }

    // Check environment variables
    const apiUrl = process.env.KLARA_API_URL || 'https://api.klara.ch';
    const apiKey = process.env.KLARA_API_KEY;
    const apiSecret = process.env.KLARA_API_SECRET;

    const config = {
      apiUrl,
      apiKeyConfigured: !!apiKey,
      apiSecretConfigured: !!apiSecret,
      apiKeyLength: apiKey?.length || 0,
      apiKeyFirst10: apiKey?.substring(0, 10) || '',
    };

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'KLARA_API_KEY not configured in environment variables',
        config,
        solution: 'Please add KLARA_API_KEY to your .env file',
      }, { status: 500 });
    }

    // Test 1: Simple connection test
    console.log('🔍 Testing KLARA API connection...');
    console.log('📍 API URL:', apiUrl);

    const testUrl = `${apiUrl}/core/latest/articles?limit=5`;

    let response;
    let responseTime: number;
    const startTime = Date.now();

    try {
      response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Accept-Language': 'de',
          'X-API-Key': apiKey,
        },
        // No cache for test
      });
      responseTime = Date.now() - startTime;
    } catch (fetchError: any) {
      console.error('❌ Fetch failed:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to KLARA API',
        details: fetchError.message,
        possibleCauses: [
          'Network connection issue',
          'API URL is incorrect',
          'Firewall blocking the request',
          'KLARA API is down',
        ],
        config,
        responseTime: Date.now() - startTime,
      }, { status: 500 });
    }

    console.log(`📡 Response Status: ${response.status} (${responseTime}ms)`);

    // Try to parse response
    let responseData;
    let responseText = '';

    try {
      responseText = await response.text();
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = responseText;
    }

    // Test 2: Check response status
    if (!response.ok) {
      console.error('❌ API returned error status:', response.status);

      let errorAnalysis = 'Unknown error';
      let solution = 'Check KLARA API documentation';

      if (response.status === 401) {
        errorAnalysis = 'Authentication failed';
        solution = 'Check KLARA_API_KEY - it might be invalid or expired';
      } else if (response.status === 403) {
        errorAnalysis = 'Access forbidden';
        solution = 'Your API key may not have permission to access articles';
      } else if (response.status === 404) {
        errorAnalysis = 'Endpoint not found';
        solution = 'Check KLARA_API_URL - the endpoint path might be incorrect';
      } else if (response.status === 429) {
        errorAnalysis = 'Rate limit exceeded';
        solution = 'Too many requests - wait a few minutes and try again';
      } else if (response.status >= 500) {
        errorAnalysis = 'KLARA API server error';
        solution = 'KLARA API is experiencing issues - try again later';
      }

      return NextResponse.json({
        success: false,
        error: `KLARA API returned error status: ${response.status}`,
        errorAnalysis,
        solution,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        response: responseData,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        config,
      }, { status: 500 });
    }

    // Test 3: Validate response data
    const articlesArray = Array.isArray(responseData) ? responseData : [];

    if (articlesArray.length === 0) {
      return NextResponse.json({
        success: false,
        warning: 'API connection successful but no articles returned',
        possibleCauses: [
          'No products configured in KLARA',
          'Products are not published/active',
          'Category filter is too restrictive',
        ],
        status: response.status,
        responseTime,
        articlesCount: 0,
        config,
      });
    }

    // Test 4: Check article structure
    const firstArticle = articlesArray[0];
    const articleStructure = {
      hasId: !!firstArticle?.id,
      hasArticleNumber: !!firstArticle?.articleNumber,
      hasName: !!(firstArticle?.nameDE || firstArticle?.nameEN),
      hasPrice: !!firstArticle?.pricePeriods?.[0]?.price,
      hasCategories: !!firstArticle?.posCategories,
    };

    const missingFields = [];
    if (!articleStructure.hasId) missingFields.push('id');
    if (!articleStructure.hasArticleNumber) missingFields.push('articleNumber');
    if (!articleStructure.hasName) missingFields.push('name (nameDE/nameEN)');
    if (!articleStructure.hasPrice) missingFields.push('price (pricePeriods)');

    // Test 5: Get last sync info
    const lastSync = await prisma.klaraSync.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    // Success response
    return NextResponse.json({
      success: true,
      message: 'KLARA API connection successful!',
      status: response.status,
      responseTime: `${responseTime}ms`,
      articlesFound: articlesArray.length,
      articleStructure,
      missingFields: missingFields.length > 0 ? missingFields : null,
      firstArticle: {
        id: firstArticle?.id,
        articleNumber: firstArticle?.articleNumber,
        name: firstArticle?.nameDE || firstArticle?.nameEN,
        price: firstArticle?.pricePeriods?.[0]?.price,
        categoriesCount: firstArticle?.posCategories?.length || 0,
      },
      lastSync: lastSync ? {
        syncType: lastSync.syncType,
        status: lastSync.status,
        created: lastSync.recordsCreated,
        updated: lastSync.recordsUpdated,
        failed: lastSync.recordsFailed,
        startedAt: lastSync.startedAt,
        completedAt: lastSync.completedAt,
        errors: lastSync.errorLog,
      } : null,
      config,
    });

  } catch (error: any) {
    console.error('❌ KLARA Test Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during KLARA API test',
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
