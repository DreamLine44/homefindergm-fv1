import { getInitials } from "../../utils/helpers";

export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 flex flex-col items-center text-center">
      <div className="relative mb-4">
        {profile?.avatar ? (
          <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold ring-4 ring-brand-50">
            {getInitials(profile?.name)}
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold text-stone-900 font-display">{profile?.name || "User"}</h3>
      <p className="text-sm text-stone-500 mt-1">{profile?.email}</p>
      {profile?.phone && <p className="text-sm text-stone-500">{profile.phone}</p>}
      {profile?.bio && <p className="text-sm text-stone-600 mt-3 leading-relaxed">{profile.bio}</p>}
    </div>
  );
}
