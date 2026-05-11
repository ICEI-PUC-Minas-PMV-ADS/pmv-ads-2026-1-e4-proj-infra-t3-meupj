import OrderDetailClient from './OrderDetailClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <OrderDetailClient />;
}
