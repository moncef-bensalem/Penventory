import { NextResponse } from 'next/server';

export function validateJsonResponse(handler) {
  return async (req, ctx) => {
    try {
      const response = await handler(req, ctx);
      
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('JSON validation error:', error);
      return NextResponse.json(
        { error: `Erreur de format de réponse: ${error.message}` },
        { status: 500 }
      );
    }
  };
}
