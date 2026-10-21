import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { parseApprovalRuleDraft } from '@/lib/approval-rules';
import {
  getApprovalRule,
  updateApprovalRule,
} from '@/lib/ct/approval-rules';
import { getSessionApiRoot } from '@/lib/ct/session';

async function sessionContext() {
  const { apiRoot, session } = await getSessionApiRoot();
  if (!session.customerId) {
    throw Object.assign(new Error('Not signed in'), { statusCode: 401 });
  }
  return { apiRoot, customerId: session.customerId };
}

function requireBusinessUnitKey(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw Object.assign(new Error('Business unit is required'), {
      statusCode: 400,
    });
  }
  return value.trim();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const businessUnitKey = requireBusinessUnitKey(
      req.nextUrl.searchParams.get('businessUnitKey'),
    );
    const { apiRoot, customerId } = await sessionContext();
    return NextResponse.json(
      await getApprovalRule(apiRoot, customerId, businessUnitKey, id),
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { businessUnitKey?: unknown };
    const businessUnitKey = requireBusinessUnitKey(body.businessUnitKey);
    const draft = parseApprovalRuleDraft(body);
    const { apiRoot, customerId } = await sessionContext();
    return NextResponse.json(
      await updateApprovalRule(apiRoot, customerId, businessUnitKey, id, draft),
    );
  } catch (error) {
    return apiError(error);
  }
}
