declare module 'next/server' {
  export interface NextRequest {
    json: () => Promise<any>;
    signal?: AbortSignal;
  }

  export const NextResponse: {
    json: (body: any, init?: { status?: number }) => any;
  };
}
