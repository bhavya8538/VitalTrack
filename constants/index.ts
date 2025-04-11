export const GenderOptions = ["Male", "Female", "Other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Passport",
  "Student ID Card",
  "Voter ID Card",
];

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: " Siddhartha Mukherjee ",
    password:"sid"
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Sudhansu Bhattacharyya",
    password:"sud"
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: " Surbhi Anand – Endodontist",
    password:"sur"
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Ashish Sabharwal- Urologist",
    password:"ash"
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Sanjay Sachdeva – Otorhinolaryngologist",
    password:"san"
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: " Aditya Gupta – Neurosurgeon",
    password:"adi"
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "H. S. Chhabra – Endoscopic surgeon",
    password:"hs"
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: " Gaurav Kharya – Pediatrician",
    password:"gau"
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: " Hardik Sharma",
    password:"har"
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};

// types/index.ts or types.d.ts
export type Appointment = {
  $id: string;
  patientName: string;
  schedule: string;
  status: "pending" | "scheduled" | "cancelled" | "completed";
  primaryPhysician?: string;
  cancellationReason?: string;
  [key: string]: any;
};

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const PATIENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_PATIENTS_COLLECTION_ID!;
