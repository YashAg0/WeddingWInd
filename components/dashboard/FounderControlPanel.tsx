"use client";

import React, { useState } from "react";
import { updateSystemConfigAction, updateSiteCMSAction, createCouponAction, toggleCouponAction, deleteCouponAction } from "@/lib/actions/founder";
import { UploadButton } from "@/lib/uploadthing";
import { 
  Layout, 
  Coins, 
  ShieldAlert, 
  Tag, 
  FileText, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Power
} from "lucide-react";
import { motion } from "framer-motion";

interface FounderControlPanelProps {
  initialConfig: any;
  initialCMS: any;
  initialCoupons: any[];
}

export default function FounderControlPanel({ initialConfig, initialCMS, initialCoupons }: FounderControlPanelProps) {
  const [activeTab, setActiveTab] = useState<"cms" | "financials" | "verification" | "coupons" | "legal" | "seo" | "maintenance">("cms");
  
  const [config, setConfig] = useState(initialConfig || {});
  const [cms, setCms] = useState(initialCMS || {});
  const [coupons, setCoupons] = useState<any[]>(initialCoupons || []);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: 10,
    discountAmount: 0,
    minSpend: 100,
    maxUses: 100,
    expiresAt: "",
  });

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await updateSystemConfigAction(config);
      if (res.success) {
        setConfig(res.config);
        notifySuccess("Platform System Settings & Financial Rules updated successfully!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await updateSiteCMSAction(cms);
      if (res.success) {
        setCms(res.cms);
        notifySuccess("Homepage & Site Content published live instantly!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update site CMS content.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await createCouponAction(newCoupon);
      if (res.success) {
        setCoupons([res.coupon, ...coupons]);
        setNewCoupon({ code: "", discountPercent: 10, discountAmount: 0, minSpend: 100, maxUses: 100, expiresAt: "" });
        notifySuccess(`Promo coupon "${res.coupon.code}" created!`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentActive: boolean) => {
    try {
      await toggleCouponAction(couponId, !currentActive);
      setCoupons(coupons.map(c => c.id === couponId ? { ...c, active: !currentActive } : c));
      notifySuccess("Coupon status updated.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update coupon status.");
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteCouponAction(couponId);
      setCoupons(coupons.filter(c => c.id !== couponId));
      notifySuccess("Coupon deleted.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Control Panel Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-warm-200 scrollbar-none">
        {[
          { id: "cms", label: "Homepage & Hero CMS", icon: Layout },
          { id: "financials", label: "Financials & Fees", icon: Coins },
          { id: "verification", label: "Verification Rules", icon: ShieldAlert },
          { id: "coupons", label: "Coupons & Promos", icon: Tag },
          { id: "legal", label: "Legal & Support", icon: FileText },
          { id: "seo", label: "SEO & Metadata", icon: Search },
          { id: "maintenance", label: "Emergency Lock", icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-maroon-600 text-white shadow-sm"
                  : "bg-warm-100/60 text-charcoal-700 hover:bg-warm-200"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </motion.div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {/* TAB 1: HOMEPAGE & HERO CMS */}
      {activeTab === "cms" && (
        <form onSubmit={handleSaveCMS} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Layout className="w-5 h-5 text-maroon-600" />
              Homepage Hero & Core Branding Editor
            </h3>
            <p className="text-charcoal-500 text-xs">
              Every sentence, button text, link destination, and background media on the homepage updates live instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Hero Eyebrow Label</label>
              <input
                type="text"
                value={cms.heroEyebrow || ""}
                onChange={(e) => setCms({ ...cms, heroEyebrow: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Main Hero Headline</label>
              <input
                type="text"
                value={cms.heroTitle || ""}
                onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
                className="input-luxury text-xs font-display font-bold"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Hero Subtitle Copy</label>
              <textarea
                value={cms.heroSubtitle || ""}
                onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
                rows={3}
                className="input-luxury text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Primary CTA Button Text</label>
              <input
                type="text"
                value={cms.heroPrimaryCtaText || ""}
                onChange={(e) => setCms({ ...cms, heroPrimaryCtaText: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Primary CTA Target URL</label>
              <input
                type="text"
                value={cms.heroPrimaryCtaUrl || ""}
                onChange={(e) => setCms({ ...cms, heroPrimaryCtaUrl: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Secondary CTA Button Text</label>
              <input
                type="text"
                value={cms.heroSecondaryCtaText || ""}
                onChange={(e) => setCms({ ...cms, heroSecondaryCtaText: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Secondary CTA Target URL</label>
              <input
                type="text"
                value={cms.heroSecondaryCtaUrl || ""}
                onChange={(e) => setCms({ ...cms, heroSecondaryCtaUrl: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Hero Background Image URL</label>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={cms.heroBgImageUrl || ""}
                  onChange={(e) => setCms({ ...cms, heroBgImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="input-luxury text-xs flex-1"
                />
                <UploadButton
                  endpoint="weddingImage"
                  onClientUploadComplete={(res: any) => {
                    if (res?.[0]) setCms((prev: any) => ({ ...prev, heroBgImageUrl: res[0].url }));
                  }}
                  onUploadError={(err: Error) => setErrorMsg(err.message)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-warm-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md cursor-pointer">
              {saving ? "Saving CMS..." : "Publish Homepage Changes"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: FINANCIALS & FEES */}
      {activeTab === "financials" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-maroon-600" />
              Financial & Platform Fee Structure Engine
            </h3>
            <p className="text-charcoal-500 text-xs">
              Configure platform commission percentages, travel agent cuts, referral rewards, and tax rates without writing a single line of code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Platform Commission Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.platformFeePercent ?? 15}
                onChange={(e) => setConfig({ ...config, platformFeePercent: parseFloat(e.target.value) })}
                className="input-luxury text-xs font-mono"
              />
              <p className="text-[0.6875rem] text-charcoal-400">Platform take-rate on every guest booking.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Travel Agent Commission Cut (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.agentCommissionPercent ?? 10}
                onChange={(e) => setConfig({ ...config, agentCommissionPercent: parseFloat(e.target.value) })}
                className="input-luxury text-xs font-mono"
              />
              <p className="text-[0.6875rem] text-charcoal-400">Commission awarded to travel agency partners on referrals.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">User Referral Reward Cut (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.referralRewardPercent ?? 5}
                onChange={(e) => setConfig({ ...config, referralRewardPercent: parseFloat(e.target.value) })}
                className="input-luxury text-xs font-mono"
              />
              <p className="text-[0.6875rem] text-charcoal-400">Peer-to-peer referral reward credit on completed check-ins.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">GST / Tax Calculation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.taxPercent ?? 18}
                onChange={(e) => setConfig({ ...config, taxPercent: parseFloat(e.target.value) })}
                className="input-luxury text-xs font-mono"
              />
              <p className="text-[0.6875rem] text-charcoal-400">Automated statutory tax rate calculated at checkout.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Primary Base Currency Code</label>
              <select
                value={config.currencyCode || "USD"}
                onChange={(e) => setConfig({ ...config, currencyCode: e.target.value })}
                className="input-luxury text-xs font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Secondary Supported Currencies</label>
              <input
                type="text"
                value={config.secondaryCurrencies || "INR,EUR,GBP,AED"}
                onChange={(e) => setConfig({ ...config, secondaryCurrencies: e.target.value })}
                className="input-luxury text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-warm-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md cursor-pointer">
              {saving ? "Updating..." : "Save Financial Rules"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: VERIFICATION RULES */}
      {activeTab === "verification" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-maroon-600" />
              Trust & Safety Verification Policies
            </h3>
            <p className="text-charcoal-500 text-xs">
              Enforce strict mandatory identity checks across Traveler, Host, and Agent roles.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-warm-50 border border-warm-200 rounded-2xl cursor-pointer">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">Require Mandatory Traveler Identity Verification</span>
                <span className="text-[0.6875rem] text-charcoal-500">Travelers must upload Passport & Government ID before reserving guest passes.</span>
              </div>
              <input
                type="checkbox"
                checked={config.requireTravelerVerification ?? true}
                onChange={(e) => setConfig({ ...config, requireTravelerVerification: e.target.checked })}
                className="w-5 h-5 text-maroon-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-warm-50 border border-warm-200 rounded-2xl cursor-pointer">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">Require Mandatory Host Family Verification</span>
                <span className="text-[0.6875rem] text-charcoal-500">Hosts must submit PAN, Aadhaar & Venue receipts before publishing weddings.</span>
              </div>
              <input
                type="checkbox"
                checked={config.requireHostVerification ?? true}
                onChange={(e) => setConfig({ ...config, requireHostVerification: e.target.checked })}
                className="w-5 h-5 text-maroon-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-warm-50 border border-warm-200 rounded-2xl cursor-pointer">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">Require Mandatory Travel Agent Licensing</span>
                <span className="text-[0.6875rem] font-medium text-charcoal-500">Travel agents must upload trade licenses before earning referral commissions.</span>
              </div>
              <input
                type="checkbox"
                checked={config.requireAgentVerification ?? true}
                onChange={(e) => setConfig({ ...config, requireAgentVerification: e.target.checked })}
                className="w-5 h-5 text-maroon-600 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="pt-6 border-t border-warm-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md cursor-pointer">
              {saving ? "Updating..." : "Save Verification Rules"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: COUPONS & PROMOS */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateCoupon} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-maroon-600" />
              Create Promo Coupon Code
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="LUXURY2026"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="input-luxury text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Discount %</label>
                <input
                  type="number"
                  value={newCoupon.discountPercent}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: parseFloat(e.target.value) })}
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[0.625rem] font-bold text-charcoal-500 uppercase tracking-wider block mb-1">Max Uses</label>
                <input
                  type="number"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) })}
                  className="input-luxury text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm flex items-center gap-2 cursor-pointer">
                <Plus size={14} /> Create Coupon Code
              </button>
            </div>
          </form>

          {/* Active Coupons List */}
          <div className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
            <h4 className="font-display font-bold text-base text-charcoal-900 border-b border-warm-100 pb-3">
              Active Promo Register ({coupons.length})
            </h4>

            {coupons.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400 font-semibold">No promotional coupons created yet.</div>
            ) : (
              <div className="space-y-3">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-warm-50/50 border border-warm-200 rounded-2xl text-xs">
                    <div>
                      <span className="font-mono font-bold text-charcoal-900 bg-white px-2 py-1 rounded border border-warm-200 text-xs mr-3">
                        {c.code}
                      </span>
                      <span className="text-charcoal-600 font-semibold">{c.discountPercent}% Off</span>
                      <span className="text-charcoal-400 ml-3">Used: {c.usedCount}/{c.maxUses || "∞"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(c.id, c.active)}
                        className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          c.active ? "bg-emerald-100 text-emerald-700" : "bg-charcoal-100 text-charcoal-500"
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LEGAL & SUPPORT */}
      {activeTab === "legal" && (
        <form onSubmit={handleSaveCMS} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-maroon-600" />
              Legal Policies & Support Concierge Details
            </h3>
            <p className="text-charcoal-500 text-xs">
              Edit Terms of Service, Privacy Policy, and Concierge contact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Concierge Support Email</label>
              <input
                type="email"
                value={cms.supportContactEmail || "contact@weddingwithindia.com"}
                onChange={(e) => setCms({ ...cms, supportContactEmail: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Concierge Support Hotline</label>
              <input
                type="text"
                value={cms.supportContactPhone || "+91 11 4000 5000"}
                onChange={(e) => setCms({ ...cms, supportContactPhone: e.target.value })}
                className="input-luxury text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Terms of Service Content (Markdown/HTML)</label>
              <textarea
                value={cms.termsOfServiceContent || ""}
                onChange={(e) => setCms({ ...cms, termsOfServiceContent: e.target.value })}
                rows={5}
                className="input-luxury text-xs font-mono resize-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Privacy Policy Content (Markdown/HTML)</label>
              <textarea
                value={cms.privacyPolicyContent || ""}
                onChange={(e) => setCms({ ...cms, privacyPolicyContent: e.target.value })}
                rows={5}
                className="input-luxury text-xs font-mono resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-warm-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md cursor-pointer">
              {saving ? "Saving..." : "Save Legal Policies"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: SEO & METADATA */}
      {activeTab === "seo" && (
        <form onSubmit={handleSaveCMS} className="bg-white border border-warm-200/60 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-warm-100 pb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-maroon-600" />
              Global SEO & Social Graph Metadata
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Global Default HTML Title</label>
              <input
                type="text"
                value={cms.siteTitle || ""}
                onChange={(e) => setCms({ ...cms, siteTitle: e.target.value })}
                className="input-luxury text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Meta Description</label>
              <textarea
                value={cms.metaDescription || ""}
                onChange={(e) => setCms({ ...cms, metaDescription: e.target.value })}
                rows={3}
                className="input-luxury text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Twitter Handle</label>
              <input
                type="text"
                value={cms.twitterHandle || "@weddingwithindia"}
                onChange={(e) => setCms({ ...cms, twitterHandle: e.target.value })}
                className="input-luxury text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-warm-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md cursor-pointer">
              {saving ? "Saving..." : "Save SEO Metadata"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: EMERGENCY MAINTENANCE LOCK */}
      {activeTab === "maintenance" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-rose-200 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-rose-900 border-b border-rose-100 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Emergency Maintenance & Platform Lockdown Switch
            </h3>
            <p className="text-rose-700 text-xs">
              Activating Maintenance Mode locks public checkout and displays your emergency banner message to all visitors.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer">
              <div>
                <span className="font-bold text-xs text-rose-950 block">Activate System Maintenance Mode</span>
                <span className="text-[0.6875rem] text-rose-700">Lock platform checkout and display custom maintenance banner.</span>
              </div>
              <input
                type="checkbox"
                checked={config.maintenanceMode ?? false}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="w-5 h-5 text-rose-600 rounded cursor-pointer"
              />
            </label>

            <div className="space-y-1.5">
              <label className="text-[0.6875rem] font-bold text-charcoal-600 uppercase tracking-wider block">Maintenance Banner Message</label>
              <textarea
                value={config.maintenanceMessage || ""}
                onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
                placeholder="We are currently upgrading our platform security infrastructure. Reservations will resume at 22:00 IST."
                rows={3}
                className="input-luxury text-xs resize-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-rose-100 flex justify-end">
            <button type="submit" disabled={saving} className="btn bg-rose-600 text-white hover:bg-rose-700 btn-md cursor-pointer">
              {saving ? "Updating..." : "Save Emergency Settings"}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
