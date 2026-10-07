import { NextRequest, NextResponse } from 'next/server';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { apiError } from '@/app/api/_utils';
import { ASSOCIATE_ROLES } from '@/lib/company';
import {
  createAssociate,
  createBusinessUnitAddress,
  createBusinessUnit,
  getCompanyManagement,
  removeAssociate,
  removeBusinessUnitAddress,
  updateAssociate,
  updateBusinessUnitAddress,
  updateBusinessUnit,
  updateCompanyDetails,
} from '@/lib/ct/company';
import { getSessionApiRoot } from '@/lib/ct/session';

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requireAddress(value: unknown): BaseAddress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Address is required');
  }
  const address = value as Record<string, unknown>;
  return {
    firstName: requireText(address.firstName, 'First name'),
    lastName: requireText(address.lastName, 'Last name'),
    company: requireText(address.company, 'Company'),
    streetName: requireText(address.streetName, 'Street name'),
    city: requireText(address.city, 'City'),
    postalCode: requireText(address.postalCode, 'Postal code'),
    state: requireText(address.state, 'State'),
    country: requireText(address.country, 'Country'),
    ...(typeof address.phone === 'string' ? { phone: address.phone } : {}),
  };
}

function requireRoles(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some(
      (role) => typeof role !== 'string' || !ASSOCIATE_ROLES.includes(role as typeof ASSOCIATE_ROLES[number]),
    )
  ) {
    throw new Error('At least one role is required');
  }
  return [...new Set(value)];
}

async function sessionContext() {
  const { apiRoot, session } = await getSessionApiRoot();
  if (!session.customerId) throw new Error('Not signed in');
  return { apiRoot, customerId: session.customerId };
}

export async function GET() {
  try {
    const { apiRoot, customerId } = await sessionContext();
    const company = await getCompanyManagement(apiRoot, customerId);
    if (!company) return NextResponse.json({ message: 'No company is linked to this account' }, { status: 404 });
    return NextResponse.json(company);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      resource?: string;
      businessUnitId?: unknown;
      name?: unknown;
      email?: unknown;
      roles?: unknown;
      address?: unknown;
      defaultShipping?: unknown;
      defaultBilling?: unknown;
    };
    const { apiRoot, customerId } = await sessionContext();
    if (body.resource === 'address') {
      return NextResponse.json(await createBusinessUnitAddress(
        apiRoot,
        customerId,
        requireText(body.businessUnitId, 'Business unit id'),
        requireAddress(body.address),
        {
          shipping: Boolean(body.defaultShipping),
          billing: Boolean(body.defaultBilling),
        },
      ));
    }
    if (body.resource === 'business-unit') {
      const unit = await createBusinessUnit(apiRoot, customerId, {
        name: requireText(body.name, 'Name'),
        email: requireText(body.email, 'Email'),
      });
      return NextResponse.json(unit);
    }
    if (body.resource === 'associate') {
      const associate = await createAssociate(apiRoot, customerId, {
        name: requireText(body.name, 'Name'),
        roles: requireRoles(body.roles),
      });
      return NextResponse.json(associate);
    }
    return NextResponse.json({ message: 'Unsupported company resource' }, { status: 400 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      resource?: string;
      id?: unknown;
      businessUnitId?: unknown;
      name?: unknown;
      email?: unknown;
      roles?: unknown;
      address?: unknown;
      defaultShipping?: unknown;
      defaultBilling?: unknown;
    };
    const { apiRoot, customerId } = await sessionContext();
    if (body.resource === 'address') {
      return NextResponse.json(await updateBusinessUnitAddress(
        apiRoot,
        customerId,
        requireText(body.businessUnitId, 'Business unit id'),
        requireText(body.id, 'Address id'),
        requireAddress(body.address),
        {
          shipping: Boolean(body.defaultShipping),
          billing: Boolean(body.defaultBilling),
        },
      ));
    }
    if (body.resource === 'company') {
      return NextResponse.json(await updateCompanyDetails(apiRoot, customerId, {
        name: requireText(body.name, 'Name'),
        email: requireText(body.email, 'Email'),
      }));
    }
    const id = requireText(body.id, 'Id');
    if (body.resource === 'business-unit') {
      return NextResponse.json(await updateBusinessUnit(apiRoot, customerId, id, {
        name: requireText(body.name, 'Name'),
        email: requireText(body.email, 'Email'),
      }));
    }
    if (body.resource === 'associate') {
      return NextResponse.json(await updateAssociate(apiRoot, customerId, id, {
        name: requireText(body.name, 'Name'),
        roles: requireRoles(body.roles),
      }));
    }
    return NextResponse.json({ message: 'Unsupported company resource' }, { status: 400 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json() as { resource?: string; id?: unknown; businessUnitId?: unknown };
    const { apiRoot, customerId } = await sessionContext();
    if (body.resource === 'associate') {
      await removeAssociate(apiRoot, customerId, requireText(body.id, 'Id'));
    } else if (body.resource === 'address') {
      await removeBusinessUnitAddress(
        apiRoot,
        customerId,
        requireText(body.businessUnitId, 'Business unit id'),
        requireText(body.id, 'Address id'),
      );
    } else {
      return NextResponse.json({ message: 'Unsupported company resource' }, { status: 400 });
    }
    return NextResponse.json({ removed: true });
  } catch (error) {
    return apiError(error);
  }
}
