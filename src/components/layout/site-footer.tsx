import { SalonContact } from "@/lib/marketing-content";

type SiteFooterProps = {
  contact?: SalonContact;
};

export function SiteFooter({ contact }: SiteFooterProps) {
  const displayedContact = contact ?? {
    phone: "+41 79 123 45 67",
    email: "hello@schnittwerk.ch",
    streetAddress: "Rorschacherstrasse 152",
    postalCode: "9000",
    city: "St. Gallen",
  };

  return (
    <footer className="border-t border-border/70 bg-white/80">
      <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} SCHNITTWERK by Vanessa Carosella. Alle Rechte vorbehalten.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a className="hover:text-foreground" href={`tel:${displayedContact.phone}`}>
            {displayedContact.phone}
          </a>
          <a className="hover:text-foreground" href={`mailto:${displayedContact.email}`}>
            {displayedContact.email}
          </a>
          <span>
            {displayedContact.streetAddress}, {displayedContact.postalCode} {displayedContact.city}
          </span>
        </div>
      </div>
    </footer>
  );
}
