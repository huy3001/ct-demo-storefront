import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/app/api/_utils';
import { syncPendingFlowNotifications } from '@/lib/ct/approval-flows';
import {
  listNotifications,
  markNotificationRead,
} from '@/lib/ct/approval-flow-notifications';
import { getSessionApiRoot } from '@/lib/ct/session';

export async function GET() {
  try {
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    await syncPendingFlowNotifications(apiRoot, session.customerId).catch(
      () => undefined,
    );
    return NextResponse.json(await listNotifications(apiRoot, session.customerId));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { flowId } = (await req.json()) as { flowId?: unknown };
    if (typeof flowId !== 'string' || !flowId) {
      return NextResponse.json({ message: 'Flow is required' }, { status: 400 });
    }
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    await markNotificationRead(apiRoot, session.customerId, flowId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
