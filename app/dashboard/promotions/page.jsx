export default function PromotionsPage() {
  // Define amount with a default value to avoid reference error
  const amount = 0;
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'TND',
  }).format(amount);
  
  return (
    <div>
      <h1>Promotions</h1>
      <p>Formatted amount: {formatted}</p>
    </div>
  );
}