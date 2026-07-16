export type HelpRequestKind =
  | "list-property"
  | "upload-photos"
  | "write-listing"
  | "find-house"
  | "verify-account"
  | "contact-support";

export interface HelpRequest {
  id: string;
  kind: HelpRequestKind;
  user: string;
  phone: string;
  location?: string;
  message: string;
  submitted: string;
  status: "new" | "in-progress" | "done";
}

export const helpKindMeta: Record<HelpRequestKind, { emoji: string; label: string }> = {
  "list-property":  { emoji: "🏠", label: "Help Me List My Property" },
  "upload-photos":  { emoji: "📸", label: "Help Me Upload Photos" },
  "write-listing":  { emoji: "✍️", label: "Help Me Write My Listing" },
  "find-house":     { emoji: "🔍", label: "Help Me Find a House" },
  "verify-account": { emoji: "✔️", label: "Help Me Verify My Account" },
  "contact-support":{ emoji: "💬", label: "Contact Support" },
};

export const helpRequestsSeed: HelpRequest[] = [
  { id: "h1", kind: "list-property",  user: "Peter M.",  phone: "+254712334455", location: "Ruiru",     message: "I have a 2BR in Ruiru, can someone list it for me?", submitted: "20 min ago", status: "new" },
  { id: "h2", kind: "upload-photos",  user: "Grace M.",  phone: "+254733112233", location: "Kilimani",  message: "Need help getting professional photos.",                 submitted: "1h ago",     status: "new" },
  { id: "h3", kind: "verify-account", user: "James O.",  phone: "+254722334455", location: "Nairobi",   message: "Uploaded my ID last week, awaiting approval.",           submitted: "3h ago",     status: "in-progress" },
  { id: "h4", kind: "write-listing",  user: "Anne W.",   phone: "+254745667788", location: "Kiambu",    message: "Not sure how to describe my compound.",                  submitted: "yesterday", status: "new" },
  { id: "h5", kind: "find-house",     user: "David K.",  phone: "+254701998877", location: "Juja",      message: "Looking for a bedsitter near JKUAT under 12k.",          submitted: "2d ago",     status: "done" },
];
