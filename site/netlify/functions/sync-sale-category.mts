import { syncSaleCategory } from '@/lib/ct/sale-category';

export default async function syncSaleCategoryOnSchedule() {
  const result = await syncSaleCategory();
  console.log('Sale category synchronized.', result);
  return Response.json(result);
}
