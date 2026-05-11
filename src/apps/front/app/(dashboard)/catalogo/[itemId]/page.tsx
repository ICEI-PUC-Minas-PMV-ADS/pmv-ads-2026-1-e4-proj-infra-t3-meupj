import EditItemClient from './EditItemClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <EditItemClient />;
}
