import { Link } from "@tanstack/react-router";
import { Building2, Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-app py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">Keja<span className="text-primary">Hub</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Kenya's most trusted property marketplace. Find. Rent. Buy. Lease — all in one place.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Twitter].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm">Browse</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/rentals" className="hover:text-foreground">Rentals</Link></li>
            <li><Link to="/airbnbs" className="hover:text-foreground">Airbnbs</Link></li>
            <li><Link to="/homes-for-sale" className="hover:text-foreground">Homes for Sale</Link></li>
            
            <li><Link to="/commercial-property" className="hover:text-foreground">Commercial</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/post-listing" className="hover:text-foreground">Post a Listing</Link></li>
            <li><Link to="/property-requests" className="hover:text-foreground">Property Requests</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm">Get in touch</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@kejahub.co.ke</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 700 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KejaHub. All rights reserved.</p>
          <p>Made with care in Nairobi 🇰🇪</p>
        </div>
      </div>
    </footer>
  );
}
