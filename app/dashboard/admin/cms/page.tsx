import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import {
  adminUpsertFAQAction,
  adminDeleteFAQAction,
  adminUpsertBlogPostAction,
  adminDeleteBlogPostAction,
  adminUpsertTestimonialAction,
  adminDeleteTestimonialAction,
} from "@/lib/actions/admin";
import { HelpCircle, FileText, Quote, Plus, Trash2, Edit2, Bookmark, CheckSquare, Star } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCMSPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; action?: string; id?: string }>;
}) {
  // 1. Authorize Admin
  await requireRole([UserRole.ADMIN]);

  // 2. Fetch all CMS Collections
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: "asc" } });
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  const heroSlides = await prisma.heroContent.findMany({ orderBy: { createdAt: "desc" } });
  const stats = await prisma.homepageStat.findMany({ orderBy: { order: "asc" } });

  // Resolve searchParams
  const params = await searchParams;
  const currentTab = params.type || "faq";
  const action = params.action;
  const editId = params.id;

  let editFAQ = null;
  let editPost = null;
  let editTestimonial = null;

  if (action === "edit" && editId) {
    if (currentTab === "faq") editFAQ = faqs.find((f) => f.id === editId);
    if (currentTab === "blog") editPost = posts.find((p) => p.id === editId);
    if (currentTab === "testimonials") editTestimonial = testimonials.find((t) => t.id === editId);
  }

  // 3. Define Server Actions for Form submissions inside component
  async function handleFAQSubmit(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string || "0");

    await adminUpsertFAQAction(id || null, { question, answer, category, order });
    redirect("/dashboard/admin/cms?type=faq");
  }

  async function handleFAQDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteFAQAction(id);
    redirect("/dashboard/admin/cms?type=faq");
  }

  async function handleBlogSubmit(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const coverImage = formData.get("coverImage") as string;
    const published = formData.get("published") === "true";

    await adminUpsertBlogPostAction(id || null, { title, excerpt, content, coverImage, published });
    redirect("/dashboard/admin/cms?type=blog");
  }

  async function handleBlogDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteBlogPostAction(id);
    redirect("/dashboard/admin/cms?type=blog");
  }

  async function handleTestimonialSubmit(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const avatar = formData.get("avatar") as string;
    const quote = formData.get("quote") as string;
    const rating = parseInt(formData.get("rating") as string || "5");
    const featured = formData.get("featured") === "true";

    await adminUpsertTestimonialAction(id || null, { name, role, avatar, quote, rating, featured });
    redirect("/dashboard/admin/cms?type=testimonials");
  }

  async function handleTestimonialDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await adminDeleteTestimonialAction(id);
    redirect("/dashboard/admin/cms?type=testimonials");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal-900">
          CMS & Homepage Content Editor
        </h1>
        <p className="text-charcoal-500 text-xs sm:text-sm">
          Publish blog posts, curate customer testimonials, and manage FAQ lists.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-200 gap-6 text-sm font-semibold">
        <Link
          href="/dashboard/admin/cms?type=faq"
          className={`pb-3 border-b-2 transition-all ${
            currentTab === "faq" ? "border-maroon-800 text-[var(--color-brand-primary)]" : "border-transparent text-charcoal-400 hover:text-charcoal-600"
          }`}
        >
          Frequently Asked Questions (FAQ)
        </Link>
        <Link
          href="/dashboard/admin/cms?type=blog"
          className={`pb-3 border-b-2 transition-all ${
            currentTab === "blog" ? "border-maroon-800 text-[var(--color-brand-primary)]" : "border-transparent text-charcoal-400 hover:text-charcoal-600"
          }`}
        >
          Travel Blog Directory
        </Link>
        <Link
          href="/dashboard/admin/cms?type=testimonials"
          className={`pb-3 border-b-2 transition-all ${
            currentTab === "testimonials" ? "border-maroon-800 text-[var(--color-brand-primary)]" : "border-transparent text-charcoal-400 hover:text-charcoal-600"
          }`}
        >
          Customer Testimonials
        </Link>
      </div>

      {/* FAQ Editor */}
      {currentTab === "faq" && (
        <div className="space-y-6">
          {/* FAQ Form */}
          {action && (
            <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-2">
                {action === "edit" ? "Edit FAQ Item" : "Create FAQ Item"}
              </h3>
              <form action={handleFAQSubmit} className="space-y-4">
                {editFAQ && <input type="hidden" name="id" value={editFAQ.id} />}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Question</label>
                    <input
                      type="text"
                      name="question"
                      required
                      defaultValue={editFAQ?.question || ""}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Category</label>
                    <select
                      name="category"
                      defaultValue={editFAQ?.category || "General"}
                      className="input-luxury text-xs py-1 h-9 bg-white"
                    >
                      <option value="General">General</option>
                      <option value="Travelers">Travelers</option>
                      <option value="Host Families">Host Families</option>
                      <option value="Payments">Payments</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Display Order</label>
                    <input
                      type="number"
                      name="order"
                      min="0"
                      defaultValue={editFAQ?.order || 0}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Answer</label>
                  <textarea
                    name="answer"
                    required
                    rows={4}
                    defaultValue={editFAQ?.answer || ""}
                    className="input-luxury text-xs p-3 h-auto"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Link
                    href="/dashboard/admin/cms?type=faq"
                    className="px-4 py-2 rounded-lg border border-warm-200 text-charcoal-600 text-xs font-semibold hover:bg-warm-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Save FAQ
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FAQ List */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <HelpCircle size={18} className="text-maroon-600" />
                Frequently Asked Questions ({faqs.length})
              </h3>
              {!action && (
                <Link
                  href="/dashboard/admin/cms?type=faq&action=create"
                  className="inline-flex items-center gap-1.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Add FAQ
                </Link>
              )}
            </div>

            {faqs.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No FAQ items are registered.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((f) => (
                  <div key={f.id} className="border border-warm-200 p-4 rounded-xl flex justify-between items-start gap-4 bg-warm-50/10 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 font-bold text-charcoal-900">
                        <span className="text-[0.625rem] bg-maroon-50 text-maroon-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          {f.category}
                        </span>
                        <span>{f.question}</span>
                      </div>
                      <p className="text-charcoal-500 leading-relaxed font-medium">{f.answer}</p>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Link
                        href={`/dashboard/admin/cms?type=faq&action=edit&id=${f.id}`}
                        className="p-1 rounded bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                      >
                        <Edit2 size={12} />
                      </Link>
                      <form action={handleFAQDelete}>
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          className="p-1 rounded bg-rose-50 border border-rose-100 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blog Editor */}
      {currentTab === "blog" && (
        <div className="space-y-6">
          {/* Blog Form */}
          {action && (
            <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-2">
                {action === "edit" ? "Edit Blog Post" : "Create Blog Post"}
              </h3>
              <form action={handleBlogSubmit} className="space-y-4">
                {editPost && <input type="hidden" name="id" value={editPost.id} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Post Title</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={editPost?.title || ""}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Cover Image URL</label>
                    <input
                      type="text"
                      name="coverImage"
                      defaultValue={editPost?.coverImage || ""}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Short Excerpt / Hook</label>
                    <input
                      type="text"
                      name="excerpt"
                      defaultValue={editPost?.excerpt || ""}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Publish Immediately</label>
                    <select
                      name="published"
                      defaultValue={editPost?.published ? "true" : "false"}
                      className="input-luxury text-xs py-1 h-9 bg-white"
                    >
                      <option value="false">Save as Draft</option>
                      <option value="true">Publish Immediately</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Content Body</label>
                  <textarea
                    name="content"
                    required
                    rows={8}
                    defaultValue={editPost?.content || ""}
                    className="input-luxury text-xs p-3 h-auto"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Link
                    href="/dashboard/admin/cms?type=blog"
                    className="px-4 py-2 rounded-lg border border-warm-200 text-charcoal-600 text-xs font-semibold hover:bg-warm-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Save Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Blog Posts List */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <FileText size={18} className="text-maroon-600" />
                Blog Directory ({posts.length} Posts)
              </h3>
              {!action && (
                <Link
                  href="/dashboard/admin/cms?type=blog&action=create"
                  className="inline-flex items-center gap-1.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Write Post
                </Link>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No blog posts cataloged.
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((p) => (
                  <div key={p.id} className="border border-warm-200 p-4 rounded-xl flex justify-between items-start gap-4 bg-warm-50/10 text-xs">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 font-bold text-charcoal-950">
                        <span className={`text-[0.625rem] px-1.5 py-0.5 rounded font-bold uppercase ${
                          p.published ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-warm-200 text-charcoal-500"
                        }`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                        <span>{p.title}</span>
                      </div>
                      {p.excerpt && <p className="text-charcoal-400 text-[0.6875rem] italic">{p.excerpt}</p>}
                      <p className="text-charcoal-500 text-[0.6875rem] font-medium leading-relaxed line-clamp-1">{p.content}</p>
                      <div className="text-[0.625rem] text-charcoal-400 pt-1">
                        By {p.authorName} on {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Link
                        href={`/dashboard/admin/cms?type=blog&action=edit&id=${p.id}`}
                        className="p-1 rounded bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                      >
                        <Edit2 size={12} />
                      </Link>
                      <form action={handleBlogDelete}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="p-1 rounded bg-rose-50 border border-rose-100 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Testimonials Editor */}
      {currentTab === "testimonials" && (
        <div className="space-y-6">
          {/* Testimonial Form */}
          {action && (
            <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-2">
                {action === "edit" ? "Edit Testimonial" : "Create Testimonial"}
              </h3>
              <form action={handleTestimonialSubmit} className="space-y-4">
                {editTestimonial && <input type="hidden" name="id" value={editTestimonial.id} />}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Client Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editTestimonial?.name || ""}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Role / Location</label>
                    <input
                      type="text"
                      name="role"
                      required
                      defaultValue={editTestimonial?.role || ""}
                      placeholder="e.g. Traveler from USA"
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Avatar Image URL</label>
                    <input
                      type="text"
                      name="avatar"
                      defaultValue={editTestimonial?.avatar || ""}
                      placeholder="https://i.pravatar.cc/..."
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Rating (1-5 Stars)</label>
                    <input
                      type="number"
                      name="rating"
                      min="1"
                      max="5"
                      defaultValue={editTestimonial?.rating || 5}
                      className="input-luxury text-xs py-1 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Featured on Home</label>
                    <select
                      name="featured"
                      defaultValue={editTestimonial?.featured ? "true" : "false"}
                      className="input-luxury text-xs py-1 h-9 bg-white"
                    >
                      <option value="false">Standard Review</option>
                      <option value="true">Featured Slide</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider">Quote Text</label>
                  <textarea
                    name="quote"
                    required
                    rows={4}
                    defaultValue={editTestimonial?.quote || ""}
                    className="input-luxury text-xs p-3 h-auto"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Link
                    href="/dashboard/admin/cms?type=testimonials"
                    className="px-4 py-2 rounded-lg border border-warm-200 text-charcoal-600 text-xs font-semibold hover:bg-warm-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Testimonial List */}
          <div className="bg-white border border-warm-200/50 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-warm-100 pb-3">
              <h3 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
                <Quote size={18} className="text-maroon-600" />
                Customer Testimonials ({testimonials.length})
              </h3>
              {!action && (
                <Link
                  href="/dashboard/admin/cms?type=testimonials&action=create"
                  className="inline-flex items-center gap-1.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={13} />
                  Add Review
                </Link>
              )}
            </div>

            {testimonials.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">
                No customer testimonials cataloged.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="border border-warm-200 p-5 rounded-2xl bg-warm-50/10 flex flex-col justify-between gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex gap-1 text-amber-500 font-bold">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={idx < t.rating ? "fill-amber-500 text-amber-500" : "text-warm-300"}
                          />
                        ))}
                      </div>
                      <p className="text-charcoal-500 font-medium italic leading-relaxed">
                        &quot;{t.quote}&quot;
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-warm-150 pt-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warm-250 overflow-hidden relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.avatar || "https://i.pravatar.cc/80?img=5"}
                            alt={t.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-charcoal-900">{t.name}</div>
                          <div className="text-[0.6875rem] text-charcoal-400">{t.role}</div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Link
                          href={`/dashboard/admin/cms?type=testimonials&action=edit&id=${t.id}`}
                          className="p-1 rounded bg-white border border-warm-200 text-charcoal-600 hover:bg-warm-50"
                        >
                          <Edit2 size={12} />
                        </Link>
                        <form action={handleTestimonialDelete}>
                          <input type="hidden" name="id" value={t.id} />
                          <button
                            type="submit"
                            className="p-1 rounded bg-rose-50 border border-rose-100 text-rose-650 hover:bg-rose-500 hover:text-white cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
