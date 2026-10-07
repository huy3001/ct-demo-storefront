'use client';

import { useParams } from 'next/navigation';
import CompanyForm from '@/components/account/CompanyForm';

export default function EditCompanyPage() {
  const { id } = useParams<{ id: string }>();
  return <CompanyForm kind="company" id={id} />;
}
