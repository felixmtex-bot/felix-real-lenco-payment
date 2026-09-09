export const dynamic = 'force-dynamic';

export default function Success() {
  return (
    <div style={{ maxWidth: 600, margin: '100px auto', textAlign: 'center', background: 'white', padding: 40, borderRadius: 12 }}>
      <h1>Payment Success ✅</h1>
      <p>Thank you! Your order will be marked as paid automatically.</p >
      <a href=" ">Back to Store</a >
    </div>
  );
}
