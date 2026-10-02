export default function formatPrice(price, type = 'sale') {
  if (price === undefined || price === null) return '₹0';
  
  const formatted = price.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return type === 'rent' ? `${formatted}/mo` : formatted;
}
