import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided in form-data', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = '0x' + crypto.createHash('sha256').update(buffer).digest('hex');

    // Deterministic mock/derived CID v1 representation (bafy...)
    const cidHash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 32);
    const mockCid = `bafybeiblu${cidHash}`;

    return jsonResponse(
      {
        cid: mockCid,
        hash,
        size: buffer.length,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
      },
      201
    );
  } catch (err: any) {
    return errorResponse(`Upload failed: ${err.message}`, 500);
  }
}
