import { NextRequest, NextResponse } from 'next/server';
import type { BaseAddress } from '@commercetools/platform-sdk';
import { getSessionApiRoot } from '@/lib/ct/session';
import { getCustomerById, addCustomerAddress, removeCustomerAddress, updateCustomerAddress } from '@/lib/ct/customer';
import { apiError } from '../../_utils';

function hasRequiredAddressFields(address: BaseAddress) {
  return [
    address.firstName,
    address.lastName,
    address.company,
    address.streetName,
    address.city,
    address.postalCode,
    address.state,
    address.country,
  ].every((value) => typeof value === 'string' && value.trim().length > 0);
}

export async function POST(req: NextRequest) {
  try {
    const { address, defaultShipping, defaultBilling } = (await req.json()) as {
      address: BaseAddress;
      defaultShipping?: boolean;
      defaultBilling?: boolean;
    };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    if (!hasRequiredAddressFields(address)) {
      return NextResponse.json({ message: 'All required address fields must be completed' }, { status: 400 });
    }
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await addCustomerAddress(apiRoot, customer, address, {
      shipping: Boolean(defaultShipping),
      billing: Boolean(defaultBilling),
    });
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { addressId } = (await req.json()) as { addressId: string };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await removeCustomerAddress(apiRoot, customer, addressId);
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { addressId, address, defaultShipping, defaultBilling } = (await req.json()) as {
      addressId: string;
      address: BaseAddress;
      defaultShipping?: boolean;
      defaultBilling?: boolean;
    };
    const { apiRoot, session } = await getSessionApiRoot();
    if (!session.customerId) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    if (!hasRequiredAddressFields(address)) {
      return NextResponse.json({ message: 'All required address fields must be completed' }, { status: 400 });
    }
    const customer = await getCustomerById(apiRoot, session.customerId);
    const updated = await updateCustomerAddress(apiRoot, customer, addressId, address, {
      shipping: Boolean(defaultShipping),
      billing: Boolean(defaultBilling),
    });
    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err);
  }
}
