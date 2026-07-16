import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Hop as Home, MapPin, Camera, User, ClipboardCheck, Building2, Video, Trash2, RefreshCw, Play, Film, Loader as Loader2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/site/VideoPlayer";
import { SmartPhotoUploader, type UploadedPhoto, type PhotoCategory } from "@/components/site/SmartPhotoUploader";
import { PropertyHealthScore } from "@/components/site/PropertyHealthScore";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const LISTING_ROLES = ["seller", "landlord", "agent", "airbnb", "commercial"] as const;

const steps = [
  { icon: Home,            label: "Type",     friendly: "🏠 What type of property is it?" },
  { icon: ClipboardCheck,  label: "Details",  friendly: "✨ Tell us about it" },
  { icon: MapPin,          label: "Location", friendly: "📍 Where is your property?" },
  { icon: Camera,          label: "Photos",   friendly: "📸 Add photos" },
  { icon: Film,            label: "Video",    friendly: "🎥 Add a video tour (optional)" },
  { icon: User,            label: "Contact",  friendly: "👤 How can buyers reach you?" },
  { icon: Check,           label: "Review",   friendly: "🚀 Ready to publish" },
];

const types = [
  { key: "rental",     label: "🏠 Rental",     icon: Home,       desc: "Long-term apartment or house" },
  { key: "airbnb",     label: "🏨 Airbnb",     icon: Building2,  desc: "Short-stay / holiday home" },
  { key: "sale",       label: "🏡 Home for Sale", icon: Home,    desc: "Sell your house or apartment" },
  { key: "commercial", label: "🏢 Commercial", icon: Building2,  desc: "Office, shop or warehouse" },
];

export const Route = createFileRoute("/post-listing")({
  head: () => ({ meta: [{ title: "Post a Listing — KejaHub" }, { name: "description", content: "Reach thousands of verified buyers, renters and Airbnb guests. List your property in minutes." }] }),
  component: PostListing,
});

function PostListing() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("rental");
  const [propertySubtype, setPropertySubtype] = useState("Bedsitter");
  const [officeDetails, setOfficeDetails] = useState("");
  const [shopDetails, setShopDetails] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [size, setSize] = useState("");
  const [county, setCounty] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Role guard: only sellers, landlords, and agents can list
  if (auth.loading) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }
  if (auth.user && auth.role && !LISTING_ROLES.includes(auth.role as any)) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center px-4">
        <div className="space-y-3 max-w-md">
          <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground">
            Only Sellers, Landlords, and Agents can post property listings.
            Your current role is <span className="font-semibold capitalize">{auth.role}</span>.
          </p>
          <Button asChild className="gradient-primary text-primary-foreground">
            <a href={dashboardForRole(auth.role)}>Go to your dashboard</a>
          </Button>
        </div>
      </div>
    );
  }
  if (auth.user && !auth.role) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  }

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const submit = async () => {
    if (!auth.user) {
      toast.error("You must be signed in to post a listing.");
      return;
    }
    setSubmitting(true);
    try {
      const photoUrls = photos.filter(p => !p.error && !p.uploading && p.url).map(p => p.url!);
      const locationParts = [area, county].filter(Boolean);
      const insertData = {
        owner_id: auth.user.id,
        title: title || `${propertySubtype} in ${area || county || "Kenya"}`,
        description: description || "",
        location: locationParts.join(", ") || "Kenya",
        price: price ? parseFloat(price) : 0,
        property_type: propertySubtype,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        size: size || null,
        amenities: amenities.length > 0 ? amenities : null,
        images: photoUrls.length > 0 ? photoUrls : null,
        video_url: videoUrl,
        status: "available",
        admin_status: "pending",
      };

      const { error } = await supabase.from("properties").insert(insertData);
      if (error) throw error;

      toast.success("Your property has been submitted! Our team will review it within 24 hours.");
      navigate({ to: dashboardForRole(auth.role) as any });
    } catch (err: any) {
      const msg = err?.message ?? "Failed to submit listing";
      if (msg.includes("Invalid API key") || msg.includes("row-level security")) {
        toast.error("Database error: Make sure you are signed in and your account has permission to post listings.", { duration: 8000 });
      } else {
        toast.error(msg, { duration: 6000 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={`Step ${step + 1} of ${steps.length}`} title={steps[step].friendly} description="Verified listings get 3× more inquiries. Add a video for 5× more views. It's free." />
      <section className="container-app py-10">
        {/* Progress bar */}
        <div className="mb-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        {/* Steps */}
        <ol className="mb-10 grid grid-cols-4 md:grid-cols-7 gap-2">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s.label} className="flex flex-col items-center">
                <div className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border-2 transition-colors",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "border-primary text-primary bg-primary/10",
                  !done && !active && "border-border text-muted-foreground"
                )}>
                  {done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <p className={cn("mt-2 text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-10 shadow-elegant animate-fade-in">
          {step === 0 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">What type of property?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {types.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      type === t.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><t.icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Basic details</h2>
              <p className="text-sm text-muted-foreground -mt-2">We only ask what's relevant for a <span className="font-semibold text-foreground capitalize">{type}</span> listing.</p>
              <Field label="Listing title"><Input placeholder="e.g. Modern 2BR Apartment in Kilimani" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Price (KSh)"><Input placeholder="e.g. 65000" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
                <Field label="Price unit">
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {type === "airbnb" && <option>Per night</option>}
                    {(type === "rental" || type === "commercial") && <option>Per month</option>}
                    {type === "sale" && <option>Total</option>}
                  </select>
                </Field>
              </div>

              {/* RENTAL / SALE — bedrooms/bathrooms + property type */}
              {(type === "rental" || type === "sale") && (
                <>
                  <Field label="Property type">
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      onChange={(e) => setPropertySubtype(e.target.value)}
                      value={propertySubtype}
                    >
                      {(type === "rental"
                        ? ["Bedsitter","Single Room","Studio","1 Bedroom","2 Bedroom","3 Bedroom","Maisonette"]
                        : ["Bungalow","Townhouse","Villa","Penthouse","Maisonette"]
                      ).map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {/* Bedsitter/Single Room/Studio: hide bedroom field */}
                    {!["Bedsitter","Single Room","Studio"].includes(propertySubtype) && (
                      <Field label="Bedrooms">
                        <Input
                          type="number"
                          placeholder="e.g. 2"
                          value={["1 Bedroom","2 Bedroom","3 Bedroom"].includes(propertySubtype) ? propertySubtype.charAt(0) : bedrooms}
                          readOnly={["1 Bedroom","2 Bedroom","3 Bedroom"].includes(propertySubtype)}
                          onChange={(e) => setBedrooms(e.target.value)}
                        />
                      </Field>
                    )}
                    <Field label="Bathrooms"><Input type="number" placeholder="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} /></Field>
                    <Field label="Size"><Input placeholder="e.g. 95 sqm" value={size} onChange={(e) => setSize(e.target.value)} /></Field>
                  </div>
                </>
              )}

              {/* AIRBNB */}
              {type === "airbnb" && (
                <>
                  <Field label="Airbnb type">
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {["Entire Place","Private Room","Shared Room","Studio / All-in-One"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" /> This is a studio — sleeping, kitchenette & living area combined
                  </label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Guest capacity"><Input type="number" placeholder="e.g. 4" /></Field>
                    <Field label="Bedrooms"><Input type="number" placeholder="1 (skip for studio)" /></Field>
                    <Field label="Bathrooms"><Input type="number" placeholder="1" /></Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Check-in time"><Input type="time" defaultValue="14:00" /></Field>
                    <Field label="Check-out time"><Input type="time" defaultValue="11:00" /></Field>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Amenities</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      {["WiFi","Hot Water","Kitchen","Refrigerator","Microwave","Smart TV","Lift","Parking","Security Guard","CCTV","Backup Generator","Swimming Pool","Gym","Garden","Balcony","Rooftop","Workspace","Fast Internet","Quiet","Baby Cot","Play Area","Family Rooms"].map(a => (
                        <label key={a} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={amenities.includes(a)}
                            onChange={(e) => {
                              if (e.target.checked) setAmenities(prev => [...prev, a]);
                              else setAmenities(prev => prev.filter(x => x !== a));
                            }}
                          /> {a}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* COMMERCIAL */}
              {type === "commercial" && (
                <>
                  <Field label="Commercial type">
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      onChange={(e) => setPropertySubtype(e.target.value)}
                      value={propertySubtype}
                    >
                      {["Office","Warehouse","Shop","Mixed-use"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Floor area (sqm)"><Input type="number" placeholder="e.g. 320" /></Field>
                    {propertySubtype === "Warehouse" && <Field label="Warehouse space (sqm)"><Input type="number" placeholder="optional" /></Field>}
                    <Field label="Parking capacity"><Input type="number" placeholder="e.g. 12 bays" /></Field>
                  </div>
                  {propertySubtype === "Office" && (
                    <Field label="Office details">
                      <Textarea rows={2} placeholder="e.g. Open plan, furnished, meeting rooms, fiber internet..." />
                    </Field>
                  )}
                  {propertySubtype === "Shop" && (
                    <Field label="Shop details">
                      <Textarea rows={2} placeholder="e.g. Ground floor, street frontage, storage room, 3-phase power..." />
                    </Field>
                  )}
                </>
              )}

              <Field label="Description"><Textarea rows={4} placeholder="Tell buyers what makes your property special..." value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Location</h2>
              <Field label="County"><Input placeholder="e.g. Nairobi" value={county} onChange={(e) => setCounty(e.target.value)} /></Field>
              <Field label="Area / Estate"><Input placeholder="e.g. Kilimani" value={area} onChange={(e) => setArea(e.target.value)} /></Field>
              <Field label="Full address"><Input placeholder="Street, building, landmark" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
              <div className="aspect-[16/9] rounded-xl border border-dashed border-border bg-secondary/50 flex items-center justify-center text-muted-foreground">
                <div className="text-center"><MapPin className="h-6 w-6 mx-auto text-primary" /><p className="text-sm mt-1">Drop pin on map (preview)</p></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <PhotoUploadStep type={type} photos={photos} setPhotos={setPhotos} />
          )}

          {step === 4 && (
            <VideoUploadStep onVideoUrlChange={setVideoUrl} />
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Contact information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name"><Input placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} /></Field>
                <Field label="I am a"><Input placeholder="Owner / Agent / Developer" defaultValue="Owner" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone number"><Input placeholder="+254 7XX XXX XXX" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} /></Field>
                <Field label="Email"><Input type="email" placeholder="you@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></Field>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="font-display text-2xl font-semibold">Review & submit</h2>
              <p className="text-sm text-muted-foreground mt-1">Our team reviews listings within 24 hours to verify authenticity.</p>

              <div className="mt-6">
                <PropertyHealthScore
                  photosCount={photos.length}
                  hasLocation={!!(area || county)}
                  hasPrice={!!price}
                  hasDescription={!!description}
                  hasAmenities={amenities.length > 0}
                />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-6 space-y-3 text-sm">
                <p><span className="text-muted-foreground">Type:</span> <span className="font-semibold capitalize">{type}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold text-warning-foreground">Pending review</span></p>
                <p><span className="text-muted-foreground">Estimated approval:</span> <span className="font-semibold">Under 24 hours</span></p>
              </div>
              <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" defaultChecked className="mt-1" />
                <span>I confirm the information provided is accurate and I have rights to list this property.</span>
              </label>
            </div>
          )}

          {/* Nav */}
          <div className="mt-10 flex justify-between border-t border-border pt-6">
            <Button variant="outline" onClick={back} disabled={step === 0}><ChevronLeft className="h-4 w-4" /> Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} className="gradient-primary text-primary-foreground">Continue <ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="gradient-primary text-primary-foreground">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit listing"}
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function VideoUploadStep({ onVideoUrlChange }: { onVideoUrlChange: (url: string | null) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const formatTime = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const generateThumbnail = (videoUrl: string) => new Promise<{ thumb: string; duration: string }>((resolve) => {
    const v = document.createElement("video");
    v.src = videoUrl;
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.addEventListener("loadeddata", () => {
      v.currentTime = Math.min(1, v.duration / 4);
    });
    v.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      const ctx = canvas.getContext("2d");
      let thumb = "";
      try {
        ctx?.drawImage(v, 0, 0, canvas.width, canvas.height);
        thumb = canvas.toDataURL("image/jpeg", 0.75);
      } catch {
        thumb = "";
      }
      resolve({ thumb, duration: formatTime(v.duration) });
    });
    v.addEventListener("error", () => resolve({ thumb: "", duration: "0:00" }));
  });

  const handleFile = async (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) { toast.error("Please choose a video file."); return; }
    if (f.size > 200 * 1024 * 1024) { toast.error("Max size is 200MB."); return; }
    if (url) URL.revokeObjectURL(url);
    const objectUrl = URL.createObjectURL(f);
    setFile(f);
    setUrl(objectUrl);
    setThumbnail(null);
    setDuration(null);
    setProgress(0);
    setUploading(true);

    // Generate thumbnail locally while uploading
    generateThumbnail(objectUrl).then(({ thumb, duration }) => {
      if (thumb) setThumbnail(thumb);
      setDuration(duration);
    });

    // Real upload to Supabase Storage
    const fileExt = f.name.split(".").pop() || "mp4";
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const storagePath = `temp/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("property-media")
        .upload(storagePath, f, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (event) => {
            const pct = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            setProgress(pct);
          },
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("property-media")
        .getPublicUrl(storagePath);

      setUrl(urlData.publicUrl);
      onVideoUrlChange(urlData.publicUrl);
      setUploading(false);
      setProgress(100);
      toast.success("Video uploaded — thumbnail generated");
    } catch (err: any) {
      setUploading(false);
      toast.error(`Upload failed: ${err.message || "Unknown error"}`);
    }
  };

  const remove = () => {
    if (url) {
      // Try to remove from storage if it's a storage URL
      const path = url.includes("/property-media/") ? url.split("/property-media/")[1] : null;
      if (path) supabase.storage.from("property-media").remove([`temp/${path.split("/").pop()}`]);
    }
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    setFile(null); setUrl(null); setThumbnail(null); setDuration(null); setProgress(0); setUploading(false);
    onVideoUrlChange(null);
    toast.success("Video removed");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Add a video tour</h2>
          <p className="mt-1 text-sm text-muted-foreground">Listings with a video walkthrough get up to <span className="font-semibold text-foreground">5× more views</span>. Upload one video (max 200MB, MP4/MOV/WebM).</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          🎥 Recommended
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-6 w-full rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center transition-all hover:border-primary hover:bg-primary/5 animate-fade-in"
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Video className="h-7 w-7" />
          </div>
          <p className="mt-4 font-semibold">Click to upload video walkthrough</p>
          <p className="mt-1 text-xs text-muted-foreground">MP4, MOV or WebM · up to 200MB · 30s–5min recommended</p>
        </button>
      )}

      {file && (
        <div className="mt-6 space-y-4 animate-fade-in">
          {uploading ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary animate-pulse">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB · Uploading {progress}%</p>
                </div>
              </div>
              <Progress value={progress} className="mt-4" />
            </div>
          ) : (
            url && (
              <>
                <VideoPlayer src={url} poster={thumbnail ?? undefined} className="aspect-video w-full" />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {thumbnail ? (
                      <img src={thumbnail} alt="thumbnail" className="h-14 w-20 rounded-md object-cover" />
                    ) : (
                      <div className="grid h-14 w-20 place-items-center rounded-md bg-muted"><Play className="h-4 w-4" /></div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB {duration && `· ${duration}`} · Thumbnail auto-generated
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                      <RefreshCw className="h-4 w-4" /> Replace
                    </Button>
                    <Button variant="outline" size="sm" onClick={remove} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Tip: film in landscape, walk slowly through each room, and end outside for the best impression.
      </p>
    </div>
  );
}


function photoCategoriesFor(type: string): PhotoCategory[] {
  if (type === "airbnb") return ["Exterior","Living Room","Kitchen","Bedroom","Bathroom","Pool","Balcony"];
  if (type === "commercial") return ["Exterior","Reception","Open Space","Parking","Floor Plan"];
  // rental / sale
  return ["Living Room","Kitchen","Bedroom","Bathroom","Compound","Parking","Entrance"];
}

function requiredCategoriesFor(type: string): PhotoCategory[] {
  if (type === "commercial") return ["Exterior","Reception","Parking"];
  if (type === "airbnb") return ["Living Room","Kitchen","Bathroom","Bedroom"];
  // rental / sale
  return ["Living Room","Kitchen","Bedroom","Bathroom"];
}

function PhotoUploadStep({ type, photos, setPhotos }: {
  type: string;
  photos: UploadedPhoto[];
  setPhotos: (p: UploadedPhoto[]) => void;
}) {
  const required = requiredCategoriesFor(type);
  const uploadedCount = photos.filter((p) => !p.error && !p.uploading).length;
  const qualityScore = Math.min(100, Math.round((uploadedCount / Math.max(required.length + 2, 6)) * 100));

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Upload photos</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Take photos or choose from gallery. Categorize each photo so buyers can find what they need.
      </p>

      <div className="mt-6">
        <SmartPhotoUploader
          photos={photos}
          onPhotosChange={setPhotos}
          requiredCategories={required}
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Listing quality score</span>
          <span className={cn("text-primary", qualityScore >= 100 && "text-success")}>{qualityScore}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
          <div className={cn("h-full transition-all duration-500", qualityScore >= 100 ? "bg-success" : "gradient-primary")} style={{ width: `${qualityScore}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {qualityScore < 100 ? (
            <>Add more photos to reach 100%: <span className="font-semibold text-foreground">{required.filter((c) => !photos.some((p) => p.category === c)).join(", ") || "Add a few more photos"}</span></>
          ) : (
            <span className="font-semibold text-success">Great job! Your listing is ready.</span>
          )}
        </p>
      </div>
    </div>
  );
}
