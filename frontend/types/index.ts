export interface Workspace {
  id: string;
  slug: string;
  name: string;
  tower: "Wowo Tower" | "Wiwi Tower";
  pack: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  capacity: number;
  workspaceType: string;
  floorRange: string;
  monthlyPrice: number;
  taxRate: number;
  securityDeposit: number;
  features: string[];
  availability: "Available" | "Limited" | "Full";
  relatedSlugs: string[];
}

export interface BookingRentForm {
  tower: string;
  floor: string;
  type: string;
  commitmentTerms: string;
  date: string;
}

export interface BookingPersonalForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptTerms: boolean;
}

export interface BookingPaymentForm {
  firstName: string;
  surname: string;
  address: string;
  stateCity: string;
  countryRegion: string;
  postcode: string;
  email: string;
  cardType: string;
  cardNumber: string;
  expiryName: string;
  paymentDate: string;
  securityCode: string;
}

export interface NavItem {
  label: string;
  href: string;
}
