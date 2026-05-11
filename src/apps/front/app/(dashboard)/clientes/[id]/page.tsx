import EditClientClient from './EditClientClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <EditClientClient />;
}
