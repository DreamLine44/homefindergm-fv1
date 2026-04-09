const faqs = [
  { q: "How do I list a property?", a: "Create an account, go to your dashboard, and click 'New Listing'. Fill in the property details and upload photos." },
  { q: "Is HomeFinderGM free to use?", a: "Browsing properties is completely free. Creating listings may require a verified account." },
  { q: "How do I contact a seller?", a: "View the property details page and use the contact information provided by the listing owner." },
  { q: "Can I edit my listing after posting?", a: "Yes! Go to My Listings in your dashboard and click Edit on any of your posts." },
  { q: "How do I report a suspicious listing?", a: "Click the Report button on any property or comment page. Our team reviews all reports." },
];

export default function Help() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-4 text-center">Help Center</h1>
      <p className="text-stone-500 text-center mb-10">Frequently asked questions</p>
      <div className="space-y-4">
        {faqs.map(({ q, a }) => (
          <div key={q} className="bg-white rounded-xl border border-stone-100 p-5">
            <h3 className="font-medium text-stone-900 mb-2">{q}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
