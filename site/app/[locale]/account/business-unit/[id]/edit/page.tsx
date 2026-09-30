'use client';

import { useParams } from 'next/navigation';
import CompanyForm from '@/components/account/CompanyForm';

export default function EditBusinessUnitPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyForm kind="business-unit" id={id} />;
}
