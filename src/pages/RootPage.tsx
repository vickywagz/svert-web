function RootPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Svert</h1>
      <p style={{ color: '#666', maxWidth: '400px' }}>
        This is a storefront platform. To visit a store, use the link
        shared by the seller — it looks like{' '}
        <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px' }}>
          svert.com/m/store-name
        </code>
        .
      </p>
    </div>
  );
}

export default RootPage;