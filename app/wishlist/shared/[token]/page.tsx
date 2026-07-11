import { prisma } from "@/lib/prisma";
import { MapPin, Calendar, Users, Star, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SharedWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  // Find wishlist items matching the token
  const items = await prisma.wishlist.findMany({
    where: {
      shareableToken: token,
      isPublic: true,
    },
    include: {
      wedding: {
        include: {
          hostCouple: {
            include: { user: true },
          },
        },
      },
      traveler: {
        include: { user: true },
      },
    },
  });

  if (items.length === 0) {
    notFound();
  }

  const travelerName = items[0].traveler.fullName;
  const folderName = items[0].folder;
  const collectionName = items[0].collection;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Header card */}
      <div className="bg-gradient-brand p-8 rounded-[2.5rem] text-white shadow-xl text-center space-y-2 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
          Shared Collection
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl">
          {travelerName}&apos;s Heritage Favorites
        </h1>
        <p className="text-white/80 text-xs sm:text-sm font-medium">
          Curated Folder: <strong className="text-white">{folderName}</strong> ({collectionName})
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => {
          const w = item.wedding;
          return (
            <div key={item.id} className="bg-white border border-warm-200/50 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Cover image */}
                <div className="h-48 bg-warm-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.mainImageUrl}
                    alt={w.title}
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-warm-250 text-charcoal-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    {w.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5 text-xs">
                  <h3 className="font-display font-bold text-sm text-charcoal-900 leading-snug line-clamp-1">
                    {w.title}
                  </h3>
                  <p className="text-charcoal-500 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-maroon-600" />
                    {w.location}
                  </p>
                  
                  {item.notes && (
                    <div className="p-3 bg-warm-50 border border-warm-150 rounded-xl font-medium italic text-charcoal-500 leading-relaxed mt-2">
                      &quot;{item.notes}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-5 pt-0">
                <Link
                  href={`/weddings/${w.title.toLowerCase().replace(/ /g, "-")}`}
                  className="w-full inline-flex items-center justify-center bg-charcoal-900 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-charcoal-800 transition-colors shadow-sm"
                >
                  View Wedding Detail
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
