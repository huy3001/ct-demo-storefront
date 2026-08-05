export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-charcoal-light flex justify-between">
        <p>© {new Date().getFullYear()} Storefront. All rights reserved.</p>
        <p>Powered by commercetools</p>
      </div>
    </footer>
  );
}
