import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";

export default function SavedProperties() {
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Saved Properties</h1>
      <p className="text-stone-500 mb-8">Properties you've bookmarked for later.</p>
      <EmptyState
        icon="❤️"
        title="No saved properties yet"
        description="Browse listings and tap the heart icon to save properties you love."
        action={<Link to="/properties"><Button>Browse Properties</Button></Link>}
      />
    </div>
  );
}
