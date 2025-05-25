import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to prevent context issues
const CheckoutClientNoSSR = dynamic(
  () => import('./CheckoutClient'),
  { ssr: false }
);

export default function Page() {
  return (
    <div>
      <CheckoutClientNoSSR />
    </div>
  );
}
