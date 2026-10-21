import type {
  ByProjectKeyRequestBuilder,
  CustomerUpdateAction,
} from '@commercetools/platform-sdk';
import type { ApprovalFlowNotification } from '@/types/approval-flow';

const TYPE_KEY = 'approval-flow-notifications';
const FIELD_NAME = 'notifications';
const MAX_NOTIFICATIONS = 100;
const MAX_ATTEMPTS = 3;

// Each notification is one short string (custom field strings are length-limited):
// flowId|businessUnitKey|orderNumber|createdAt|read
function encode(entry: ApprovalFlowNotification): string {
  const clean = (value: string) => value.replace(/\|/g, '/');
  return [
    entry.flowId,
    clean(entry.businessUnitKey),
    clean(entry.orderNumber).slice(0, 80),
    entry.createdAt,
    entry.read ? '1' : '0',
  ].join('|');
}

function decode(value: string): ApprovalFlowNotification | undefined {
  const [flowId, businessUnitKey, orderNumber, createdAt, read] =
    value.split('|');
  if (!flowId || !businessUnitKey || !createdAt) return undefined;
  return {
    flowId,
    businessUnitKey,
    orderNumber: orderNumber ?? '',
    createdAt,
    read: read === '1',
  };
}

function parseField(value: unknown): ApprovalFlowNotification[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const entry = typeof item === 'string' ? decode(item) : undefined;
    return entry ? [entry] : [];
  });
}

let typeIdPromise: Promise<string> | undefined;

async function ensureType(apiRoot: ByProjectKeyRequestBuilder): Promise<string> {
  typeIdPromise ??= (async () => {
    try {
      const { body } = await apiRoot.types().withKey({ key: TYPE_KEY }).get().execute();
      return body.id;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 404) throw error;
    }
    const { body } = await apiRoot
      .types()
      .post({
        body: {
          key: TYPE_KEY,
          name: { en: 'Approval flow notifications' },
          resourceTypeIds: ['customer'],
          fieldDefinitions: [
            {
              name: FIELD_NAME,
              label: { en: 'Approval flow notifications' },
              required: false,
              type: { name: 'Set', elementType: { name: 'String' } },
              inputHint: 'MultiLine',
            },
          ],
        },
      })
      .execute();
    return body.id;
  })().catch((error: unknown) => {
    typeIdPromise = undefined;
    throw error;
  });
  return typeIdPromise;
}

async function updateNotifications(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  change: (current: ApprovalFlowNotification[]) => ApprovalFlowNotification[] | null,
): Promise<void> {
  const typeId = await ensureType(apiRoot);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { body: customer } = await apiRoot
      .customers()
      .withId({ ID: customerId })
      .get()
      .execute();
    const next = change(parseField(customer.custom?.fields[FIELD_NAME]));
    if (!next) return;

    const value = next.slice(0, MAX_NOTIFICATIONS).map(encode);
    const action: CustomerUpdateAction =
      customer.custom?.type.id === typeId
        ? { action: 'setCustomField', name: FIELD_NAME, value }
        : {
            action: 'setCustomType',
            type: { typeId: 'type', key: TYPE_KEY },
            fields: { [FIELD_NAME]: value },
          };
    try {
      await apiRoot
        .customers()
        .withId({ ID: customerId })
        .post({ body: { version: customer.version, actions: [action] } })
        .execute();
      return;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 409) throw error;
    }
  }
}

export async function listNotifications(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
): Promise<ApprovalFlowNotification[]> {
  const { body: customer } = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .get()
    .execute();
  return parseField(customer.custom?.fields[FIELD_NAME]);
}

// Flows already announced to a recipient by this server instance; the stored
// entries remain the source of truth, this only avoids repeated customer reads.
const announced = new Set<string>();

/**
 * Adds one unread notification per recipient the first time a flow is seen pending.
 * A recipient that already has an entry for the flow is left untouched.
 */
export async function notifyApprovers(
  apiRoot: ByProjectKeyRequestBuilder,
  recipientIds: string[],
  flow: { id: string; businessUnitKey: string; orderNumber: string },
): Promise<void> {
  await Promise.allSettled(
    recipientIds.map(async (customerId) => {
      const cacheKey = `${customerId}:${flow.id}`;
      if (announced.has(cacheKey)) return;
      await updateNotifications(apiRoot, customerId, (current) =>
        current.some((entry) => entry.flowId === flow.id)
          ? null
          : [
              {
                flowId: flow.id,
                businessUnitKey: flow.businessUnitKey,
                orderNumber: flow.orderNumber,
                createdAt: new Date().toISOString(),
                read: false,
              },
              ...current,
            ],
      );
      announced.add(cacheKey);
    }),
  );
}

export async function markNotificationRead(
  apiRoot: ByProjectKeyRequestBuilder,
  customerId: string,
  flowId: string,
): Promise<void> {
  await updateNotifications(apiRoot, customerId, (current) =>
    current.some((entry) => entry.flowId === flowId && !entry.read)
      ? current.map((entry) =>
          entry.flowId === flowId ? { ...entry, read: true } : entry,
        )
      : null,
  );
}
