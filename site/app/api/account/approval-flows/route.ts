import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { listApprovalFlows } from '@/lib/ct/approval-flows';
import { getSessionApiRoot } from '@/lib/ct/session';

export async function GET(req: NextRequest) {
  try {
    const businessUnitKey = req.nextUrl.searchParams.get('businessUnitKey')?.trim();
    if (!businessUnitKey) {
      return NextResponse.json(
        { message: 'Business unit is required' },
        { status: 400 },
      );
    }
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    return NextResponse.json(
      await listApprovalFlows(apiRoot, session.customerId, businessUnitKey),
    );
  } catch (error) {
    return apiError(error);
  }
}
