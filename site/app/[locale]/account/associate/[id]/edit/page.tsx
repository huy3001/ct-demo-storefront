'use client';

import { useParams } from 'next/navigation';
import CompanyForm from '@/components/account/CompanyForm';

export default function EditAssociatePage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyForm kind="associate" id={id} />;
}
