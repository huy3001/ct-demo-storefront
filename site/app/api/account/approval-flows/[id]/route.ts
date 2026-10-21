import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { decideApprovalFlow } from '@/lib/ct/approval-flows';
import { getSessionApiRoot } from '@/lib/ct/session';
import type { ApprovalDecision } from '@/types/approval-flow';

interface DecisionBody {
  businessUnitKey?: unknown;
  decision?: unknown;
  reason?: unknown;
}

function isDecision(value: unknown): value is ApprovalDecision {
  return value === 'approve' || value === 'reject';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as DecisionBody;
    const businessUnitKey =
      typeof body.businessUnitKey === 'string' ? body.businessUnitKey.trim() : '';
    if (!businessUnitKey) {
      return NextResponse.json(
        { message: 'Business unit is required' },
        { status: 400 },
      );
    }
    if (!isDecision(body.decision)) {
      return NextResponse.json(
        { message: 'Decision must be approve or reject' },
        { status: 400 },
      );
    }
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const status = await decideApprovalFlow(
      apiRoot,
      session.customerId,
      businessUnitKey,
      id,
      body.decision,
      typeof body.reason === 'string' ? body.reason : undefined,
    );
    return NextResponse.json({ status });
  } catch (error) {
    return apiError(error);
  }
}
