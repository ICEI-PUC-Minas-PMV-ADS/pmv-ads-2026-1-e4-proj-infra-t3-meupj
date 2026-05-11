import EditClientClient from './EditClientClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: 'static' }];
}

export default function Page() {
  return <EditClientClient />;
}
