"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Star, ThumbsUp, Flag, MessageSquare, ShieldAlert, Award } from "lucide-react";
import { voteReviewHelpfulAction, reportReviewAction } from "@/lib/actions/reviews";
import { ReviewReportReason } from "@prisma/client";
import Image from "next/image";

interface ReviewReplyData {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    avatar: string | null;
  };
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpfulVotes: number;
  ratingFood: number;
  ratingHospitality: number;
  ratingExperience: number;
  ratingCulture: number;
  ratingSafety: number;
  ratingAccommodation: number;
  ratingOrganization: number | null;
  ratingValue: number | null;
  ratingCommunication: number | null;
  status: string;
  traveler: {
    fullName: string;
    user: {
      name: string | null;
      avatar: string | null;
      status: string;
    };
  };
  repliesList: ReviewReplyData[];
}

interface WeddingDetailReviewsProps {
  weddingId: string;
  reviews: ReviewData[];
  userId?: string | null;
}

export function WeddingDetailReviews({ weddingId: _weddingId, reviews, userId }: WeddingDetailReviewsProps) {
  const [reviewsList, setReviewsList] = useState<ReviewData[]>(reviews);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReviewReportReason>(ReviewReportReason.SPAM);
  const [reportDetails, setReportDetails] = useState("");
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  // 1. Calculate Aggregates
  const totalReviews = reviewsList.length;
  const overallAvg = totalReviews > 0
    ? parseFloat((reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2))
    : 0;

  const categories = [
    { label: "Culture & Rituals", score: "ratingCulture" as const },
    { label: "Food & Feast", score: "ratingFood" as const },
    { label: "Hospitality & Host", score: "ratingHospitality" as const },
    { label: "Safety & Sanitation", score: "ratingSafety" as const },
    { label: "Lodging & Decor", score: "ratingAccommodation" as const },
    { label: "Organization & Value", score: "ratingExperience" as const }
  ];

  const getCategoryAvg = (field: "ratingCulture" | "ratingFood" | "ratingHospitality" | "ratingSafety" | "ratingAccommodation" | "ratingExperience") => {
    if (totalReviews === 0) return 5.0;
    const sum = reviewsList.reduce((acc, r) => acc + (r[field] ?? 5), 0);
    return parseFloat((sum / totalReviews).toFixed(1));
  };

  // 2. Star Distribution
  const starCounts = [0, 0, 0, 0, 0, 0]; // index matches star rating (1-5)
  reviewsList.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    starCounts[star] += 1;
  });

  // Jaccard Sorting / Filters
  const filteredReviews = reviewsList
    .filter((r) => {
      if (filterRating === "all") return true;
      return Math.round(r.rating) === filterRating;
    })
    .sort((a, b) => {
      if (sortBy === "helpful") {
        return b.helpfulVotes - a.helpfulVotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Actions
  const handleHelpfulVote = async (reviewId: string) => {
    if (!userId) {
      toast.error("Authentication required. Please log in to upvote reviews.");
      return;
    }
    try {
      const res = await voteReviewHelpfulAction(reviewId);
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulVotes: res.helpfulVotes } : r
        )
      );
      setVotedMap((prev) => ({ ...prev, [reviewId]: res.voted }));
    } catch (err: any) {
      toast.error(err.message || "Failed to submit helpful vote.");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportingReviewId) return;
    try {
      await reportReviewAction({
        reviewId: reportingReviewId,
        reason: reportReason,
        details: reportDetails
      });
      toast.success("Thank you. The safety desk has flagged this review for manual moderation.");
      setReportingReviewId(null);
      setReportDetails("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Summary Cards and Analytics Dashboard */}
      <div className="bg-white border border-warm-200/50 p-6 sm:p-8 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Overall score */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-warm-100 pb-6 md:pb-0 md:pr-8">
          <span className="text-charcoal-400 font-sans font-bold text-xs uppercase tracking-widest">
            Overall Rating
          </span>
          <div className="font-display font-bold text-5xl text-charcoal-900 leading-tight">
            {overallAvg || "N/A"}
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(overallAvg)
                    ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                    : "text-warm-200"
                }
              />
            ))}
          </div>
          <p className="text-charcoal-400 text-xs font-semibold">
            Based on {totalReviews} traveler logs
          </p>
        </div>

        {/* Center: Category Averages */}
        <div className="space-y-3.5 md:col-span-2">
          <h4 className="font-sans font-bold text-xs text-charcoal-400 uppercase tracking-widest mb-2">
            Experience Dimension Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {categories.map((c) => {
              const avg = getCategoryAvg(c.score);
              return (
                <div key={c.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-charcoal-700">
                    <span>{c.label}</span>
                    <span className="text-charcoal-900 flex items-center gap-1">
                      {avg} <Star size={11} className="text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]" />
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6b1026] rounded-full transition-all duration-500"
                      style={{ width: `${avg * 20}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Review Filters and List Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-warm-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRating("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterRating === "all"
                ? "bg-[#6b1026] text-white"
                : "bg-warm-100/60 text-charcoal-600 hover:bg-warm-100"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filterRating === star
                  ? "bg-[#6b1026] text-white"
                  : "bg-warm-100/60 text-charcoal-600 hover:bg-warm-100"
              }`}
            >
              {star} <Star size={11} className="fill-[var(--color-brand-secondary)] text-[var(--color-brand-secondary)]" /> ({starCounts[star]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal-400 font-bold uppercase tracking-wider">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-warm-200 rounded-lg text-xs font-bold text-charcoal-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-maroon-500 cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Helpful Votes</option>
          </select>
        </div>
      </div>

      {/* 3. Review Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white border border-warm-200/50 rounded-2xl p-6 text-charcoal-400 font-semibold text-sm">
            No reviews match your selected filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-white border border-warm-200/50 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Image
                    src={rev.traveler?.user?.avatar || (rev as any).authorAvatar || "https://i.pravatar.cc/80?img=4"}
                    alt={rev.traveler?.fullName || (rev as any).authorName || "Anonymous Guest"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border border-warm-100 flex-shrink-0"
                    unoptimized
                  />
                  <div>
                    <div className="font-bold text-charcoal-900 text-sm flex items-center gap-1.5">
                      <span>{rev.traveler?.fullName || (rev as any).authorName || "Anonymous Guest"}</span>
                      {rev.traveler?.user?.status === "VERIFIED" && (
                        <span className="inline-flex items-center text-[0.625rem] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-100">
                          <Award size={10} className="mr-0.5 fill-emerald-500" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="text-[0.625rem] text-charcoal-400 font-semibold">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      }) : ((rev as any).date || "Recent")}
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < rev.rating
                          ? "text-[var(--color-brand-secondary)] fill-[var(--color-brand-secondary)]"
                          : "text-warm-100"
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-charcoal-600 text-sm leading-relaxed whitespace-pre-line">
                &ldquo;{rev.comment || (rev as any).content || ""}&rdquo;
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-warm-100/60 pt-3 text-xs text-charcoal-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpfulVote(rev.id)}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-warm-200 transition-all ${
                      votedMap[rev.id]
                        ? "bg-maroon-50 text-[#6b1026] border-maroon-200"
                        : "hover:bg-warm-50 text-charcoal-500"
                    }`}
                  >
                    <ThumbsUp size={12} />
                    <span>Helpful ({rev.helpfulVotes})</span>
                  </button>

                  <button
                    onClick={() => setReportingReviewId(rev.id)}
                    className="flex items-center gap-1.5 hover:text-red-600 transition-colors py-1 px-2 text-charcoal-400"
                  >
                    <Flag size={12} />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* Host Response Section */}
              {rev.repliesList && rev.repliesList.map((reply) => (
                <div
                  key={reply.id}
                  className="mt-4 p-4 border border-warm-200 bg-warm-50/50 rounded-2xl space-y-2 border-l-4 border-l-[#6b1026]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={13} className="text-[#6b1026]" />
                      <span className="font-bold text-charcoal-800 text-xs">
                        Response from Host Family ({reply.user?.name || "Host"})
                      </span>
                    </div>
                    <span className="text-[0.625rem] text-charcoal-400 font-bold">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-charcoal-600 text-xs sm:text-sm leading-relaxed italic">
                    &ldquo;{reply.content}&rdquo;
                  </p>
                </div>
              ))}
            </article>
          ))
        )}
      </div>

      {/* 4. Report Modal Dialogue */}
      {reportingReviewId && (
        <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-warm-200 rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center gap-2 text-red-600 font-display font-bold text-lg">
              <ShieldAlert size={20} />
              <span>Flag Review for Moderation</span>
            </div>
            
            <p className="text-charcoal-500 text-xs sm:text-sm leading-relaxed">
              Help us maintain marketplace authenticity. What is incorrect or abusive about this guest review?
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-widest block mb-1">
                  Report Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-white border border-warm-200 rounded-xl text-xs font-semibold text-charcoal-850 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-maroon-500 cursor-pointer"
                >
                  <option value={ReviewReportReason.SPAM}>Spam or Duplicate Post</option>
                  <option value={ReviewReportReason.FAKE_REVIEW}>Fake Review (Not Attended)</option>
                  <option value={ReviewReportReason.HARASSMENT}>Harassment or Hate Speech</option>
                  <option value={ReviewReportReason.CONFLICT_OF_INTEREST}>Conflict of Interest (Self Review)</option>
                  <option value={ReviewReportReason.OTHER}>Other Violations</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 uppercase tracking-widest block mb-1">
                  Supporting Context
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide details for manual investigation by the Safety Desk..."
                  rows={4}
                  className="w-full border border-warm-200 rounded-xl text-xs font-medium text-charcoal-850 p-3 outline-none focus:ring-1 focus:ring-maroon-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportingReviewId(null)}
                className="px-4 py-2 rounded-xl border border-warm-200 text-charcoal-600 text-xs font-bold uppercase tracking-wider hover:bg-warm-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 cursor-pointer"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
