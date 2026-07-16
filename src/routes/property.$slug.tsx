import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatKES, priceLabel, properties, statusMeta, tierMeta, type Property } from "@/lib/mock-data";
import { Bath, BedDouble, Ruler, MapPin, ShieldCheck, Heart, Share2, Flag, GitCompare, Star, CircleCheck as CheckCircle2, Play, Images, Droplets, Zap, Wallet, ReceiptText, Clock, Building2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PropertyCard } from "@/components/site/PropertyCard";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { FullScreenGallery, type GalleryMedia } from "@/components/site/FullScreenGallery";
import { ConciergeInquiryPanel } from "@/components/site/ConciergeInquiryPanel";
import { LocationInsights } from "@/components/site/LocationInsights";
import { AvailabilityCalendar } from "@/components/site/AvailabilityCalendar";
import { roomCopy } from "@/lib/premium-copy";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/property/$slug")({
  loader: ({ params }) => {
    const p = properties.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} — KejaHub` },
      { name: "description", content: loaderData.description.slice(0, 155) },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.description.slice(0, 155) },
      { property: "og:image", content: loaderData.images[0] },
    ] : [{ title: "Property not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-app py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Property not found</h1>
      <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
      <Button asChild className="mt-6 gradient-primary text-primary-foreground"><Link to="/">Back home</Link></Button>
    </div>
  ),
  component: PropertyDetail,
});

function PropertyDetail() {
  const p = Route.useLoaderData() as Property;
  const similar = properties.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const [mediaView, setMediaView] = useState<"photos" | "video">("photos");
  const [videoOpen, setVideoOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Build gallery media list (photos + video if available)
  const galleryMedia: GalleryMedia[] = useMemo(() => {
    const photos = p.images.map((url, i) => ({
      url,
      category: i === 0 ? "Cover Photo" : `Photo ${i + 1}`,
      kind: "photo" as const,
    }));
    if (p.video) {
      photos.push({
        url: p.video.url,
        category: "Video Tour",
        kind: "video" as const,
        thumbnail: p.video.thumbnail,
        duration: p.video.duration,
      });
    }
    return photos;
  }, [p]);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <>
      {/* GALLERY */}
      <section className="border-b border-border">
        <div className="container-app py-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="capitalize">{p.category}</span>
            <span>/</span>
            <span className="text-foreground truncate">{p.title}</span>
          </div>

          {p.video && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
                <button
                  onClick={() => setMediaView("photos")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mediaView === "photos" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Images className="h-3.5 w-3.5" /> Photos
                </button>
                <button
                  onClick={() => setMediaView("video")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mediaView === "video" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Video Tour
                </button>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/90 px-2.5 py-1 text-xs font-semibold text-white">
                🎥 Video Tour Available · {p.video.duration}
              </span>
              <Button
                size="sm"
                onClick={() => setVideoOpen(true)}
                className="gradient-primary text-primary-foreground ml-auto"
              >
                <Play className="h-4 w-4 fill-current" /> Watch Video Tour
              </Button>
            </div>
          )}

          {mediaView === "video" && p.video ? (
            <VideoPlayer
              src={p.video.url}
              poster={p.video.thumbnail || p.images[0]}
              className="aspect-video w-full animate-fade-in"
              autoPlay
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2 rounded-2xl overflow-hidden animate-fade-in">
              <div className="relative sm:col-span-2 sm:row-span-2 h-64 sm:h-full group cursor-pointer" onClick={() => openGallery(0)}>
                <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {p.video && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setVideoOpen(true); }}
                    className="absolute inset-0 grid place-items-center bg-black/25 hover:bg-black/35 transition-colors"
                    aria-label="Watch video tour"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-primary shadow-elegant transition-transform hover:scale-105">
                      <Play className="h-4 w-4 fill-current" /> Watch Video Tour
                    </span>
                  </button>
                )}
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Images className="h-3.5 w-3.5" /> {p.images.length} photos
                </div>
              </div>
              {p.images.slice(1, 5).map((src: string, i: number) => (
                <div
                  key={i}
                  className="hidden sm:block relative h-full w-full cursor-pointer group"
                  onClick={() => openGallery(i + 1)}
                >
                  <img src={src} alt={`${p.title} ${i + 2}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {i === 3 && p.images.length > 5 && (
                    <div className="absolute inset-0 grid place-items-center bg-black/50">
                      <span className="text-sm font-bold text-white">+{p.images.length - 5}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-app py-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {p.status && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta[p.status].color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta[p.status].dot}`} />
                {statusMeta[p.status].label}
              </span>
            )}
            {p.verified && p.verificationTier && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tierMeta[p.verificationTier].color}`}>
                <ShieldCheck className="h-3 w-3" /> {p.verificationTier} verified
              </span>
            )}
            {p.featured && <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning-foreground">★ Featured</span>}
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary capitalize">{p.propertyType ?? p.category}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-balance">{p.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {p.location}</p>

          <div className="mt-6 flex flex-wrap gap-6 border-y border-border py-5">
            {p.bedrooms !== undefined && <Stat icon={BedDouble} label="Bedrooms" value={p.bedrooms || "Studio"} />}
            {p.bathrooms !== undefined && <Stat icon={Bath} label="Bathrooms" value={p.bathrooms} />}
            {p.size && <Stat icon={Ruler} label="Size" value={p.size} />}
            {p.guests && <Stat icon={BedDouble} label="Guests" value={p.guests} />}
          </div>

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              {p.video && <TabsTrigger value="videos">Videos</TabsTrigger>}
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-6">
              <h2 className="font-display text-xl font-semibold">About this property</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.description}</p>
            </TabsContent>
            <TabsContent value="features" className="pt-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {p.features.map((f: string) => (
                  <div key={f} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="photos" className="pt-6">
              <PhotoCategories images={p.images} onImageClick={openGallery} startIndex={0} />
            </TabsContent>
            {p.video && (
              <TabsContent value="videos" className="pt-6">
                <div>
                  <h3 className="font-display text-lg font-semibold mb-4">Video Tour</h3>
                  <VideoPlayer
                    src={p.video.url}
                    poster={p.video.thumbnail || p.images[0]}
                    className="aspect-video w-full max-w-2xl"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Duration: {p.video.duration}
                  </p>
                </div>
              </TabsContent>
            )}
            <TabsContent value="map" className="pt-6">
              <div className="aspect-[16/9] rounded-2xl border border-border bg-secondary flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto text-primary" />
                  <p className="mt-2 text-sm font-medium">Map preview</p>
                  <p className="text-xs">{p.location}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* TRANSPARENCY */}
          {p.transparency && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" /> Cost transparency</h2>
              <p className="text-sm text-muted-foreground mt-1">No surprises. Here's what tenants actually pay each month.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {p.transparency.water && (
                  <TranspCard icon={Droplets} title="Water">
                    <li>{p.transparency.water.type}</li>
                    {p.transparency.water.avgMonthly !== undefined && <li>Avg monthly: <b>{formatKES(p.transparency.water.avgMonthly)}</b></li>}
                  </TranspCard>
                )}
                {p.transparency.electricity && (
                  <TranspCard icon={Zap} title="Electricity">
                    <li>{p.transparency.electricity.type}</li>
                    {p.transparency.electricity.avgMonthly !== undefined && <li>Avg monthly: <b>{formatKES(p.transparency.electricity.avgMonthly)}</b></li>}
                  </TranspCard>
                )}
                {p.transparency.deposit && (
                  <TranspCard icon={Wallet} title="Deposit">
                    <li>Amount: <b>{formatKES(p.transparency.deposit.amount)}</b></li>
                    <li>{p.transparency.deposit.refundable ? "Refundable" : "Non-refundable"}</li>
                    {p.transparency.deposit.conditions && <li className="text-xs text-muted-foreground">{p.transparency.deposit.conditions}</li>}
                  </TranspCard>
                )}
                {p.transparency.charges && (
                  <TranspCard icon={Building2} title="Additional charges (KSh / month)">
                    {p.transparency.charges.garbage !== undefined && <li>Garbage: <b>{formatKES(p.transparency.charges.garbage)}</b></li>}
                    {p.transparency.charges.parking !== undefined && <li>Parking: <b>{formatKES(p.transparency.charges.parking)}</b></li>}
                    {p.transparency.charges.security !== undefined && <li>Security: <b>{formatKES(p.transparency.charges.security)}</b></li>}
                    {p.transparency.charges.service !== undefined && <li>Service: <b>{formatKES(p.transparency.charges.service)}</b></li>}
                  </TranspCard>
                )}
              </div>
            </div>
          )}

          {/* NEIGHBORHOOD */}
          {p.neighborhood && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-semibold">Neighborhood insights</h2>
              {p.neighborhood.scores && (
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  {(["security","quietness","convenience","family","overall"] as const).map((k) => (
                    <div key={k} className="rounded-xl border border-border bg-card p-4 text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-primary">{p.neighborhood!.scores![k]}<span className="text-sm text-muted-foreground">/10</span></p>
                    </div>
                  ))}
                </div>
              )}
              {p.neighborhood.nearby && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.neighborhood.nearby.map((n) => (
                    <div key={n.label} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm">
                      <div>
                        <p className="font-medium">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.name}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {n.minutes} min</span>
                    </div>
                  ))}
            </div>
          )}

          <LocationInsights p={p} />

          {(p.featured || p.verificationTier === "platinum" || p.verificationTier === "gold") && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-semibold">✨ Property story</h2>
              <p className="text-sm text-muted-foreground mt-1">A warm look at every space in this home.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.values(roomCopy).map((r) => (
                  <div key={r.title} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-sm">{r.emoji} {r.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.category === "airbnb" && (
            <div className="mt-14">
              <h2 className="font-display text-xl font-semibold mb-4">Availability</h2>
              <AvailabilityCalendar seed={parseInt(p.id) || 0} />
            </div>
          )}
            </div>
          )}

          {/* Q&A */}
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold">Questions & Answers</h2>
            <div className="mt-4 space-y-3">
              {[
                { q: "Is there parking on site?", a: "Yes, 2 secure basement parking bays are included." },
                { q: "Is water available 24/7?", a: "Yes — the compound has a borehole plus 2 x 10,000L backup tanks." },
              ].map((qa, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-medium">Q: {qa.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">A: {qa.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-semibold">Reviews</h2>
              <span className="inline-flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-warning text-warning" /> 4.8 · 128 reviews</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { n: "John K.", t: "Excellent place, quiet neighborhood and secure. Owner was very responsive." },
                { n: "Mary A.", t: "Photos match reality. Would definitely recommend to family and friends." },
              ].map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{r.n}</p>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SIMILAR */}
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold mb-6">Similar properties</h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((sp) => <PropertyCard key={sp.id} p={sp} />)}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Price</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary">{priceLabel(p)}</p>

            <div className="mt-6 rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate flex items-center gap-1">
                    {p.owner.type}
                    {p.owner.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                  </p>
                  <p className="text-xs text-muted-foreground">Listed by KejaHub Concierge</p>
                </div>
              </div>
              {p.owner.verificationTier && (
                <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${tierMeta[p.owner.verificationTier].color}`}>
                  <ShieldCheck className="h-3 w-3" /> {tierMeta[p.owner.verificationTier].label}
                </span>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {p.owner.responseTime && <div className="rounded-lg bg-secondary/60 p-2"><p className="text-[10px] uppercase">Responds</p><p className="font-semibold text-foreground">{p.owner.responseTime}</p></div>}
                {p.owner.activeListings !== undefined && <div className="rounded-lg bg-secondary/60 p-2"><p className="text-[10px] uppercase">Active listings</p><p className="font-semibold text-foreground">{p.owner.activeListings}</p></div>}
              </div>
            </div>

            <div className="mt-4">
              <ConciergeInquiryPanel listing={p.title} />
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2 border-t border-border pt-4">
              {[
                { i: Heart, l: "Save" },
                { i: Share2, l: "Share" },
                { i: GitCompare, l: "Compare" },
                { i: Flag, l: "Report" },
              ].map((a) => (
                <button key={a.l} onClick={() => toast.success(`${a.l} action`)} className="flex flex-col items-center gap-1 rounded-lg p-2 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground">
                  <a.i className="h-4 w-4" /> {a.l}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {p.video && (
        <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
          <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">{p.title} — Video Tour</DialogTitle>
            <VideoPlayer
              src={p.video.url}
              poster={p.video.thumbnail || p.images[0]}
              className="aspect-video w-full"
              autoPlay
            />
          </DialogContent>
        </Dialog>
      )}

      <FullScreenGallery
        media={galleryMedia}
        index={galleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onIndexChange={setGalleryIndex}
        title={p.title}
      />
    </>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function PhotoCategories({ images, onImageClick, startIndex = 0 }: {
  images: string[];
  onImageClick?: (index: number) => void;
  startIndex?: number;
}) {
  const [activeCat, setActiveCat] = useState("All");
  const cats = ["All", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Exterior", "Amenities"];
  // For mock data, distribute images across categories (since mock data doesn't have per-image categories)
  // In production with real uploads, each image would have its own category from property_media table
  const filtered = activeCat === "All"
    ? images.map((src, i) => ({ src, originalIndex: i }))
    : images.map((src, i) => ({ src, originalIndex: i })).filter((_, i) => i % cats.length === cats.indexOf(activeCat) - 1);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              activeCat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:text-primary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((item, i) => (
          <button
            key={i}
            onClick={() => onImageClick?.(startIndex + item.originalIndex)}
            className="group relative aspect-square rounded-xl overflow-hidden"
          >
            <img src={item.src} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No photos in this category yet.</p>
      )}
    </div>
  );
}

function TranspCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground [&_b]:text-foreground">{children}</ul>
    </div>
  );
}

