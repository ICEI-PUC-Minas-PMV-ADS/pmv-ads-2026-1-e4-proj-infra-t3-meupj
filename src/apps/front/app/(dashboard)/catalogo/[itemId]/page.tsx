import EditItemClient from './EditItemClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ itemId: 'static' }];
}

export default function Page() {
  return <EditItemClient />;
}
