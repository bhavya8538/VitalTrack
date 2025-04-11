// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { PatientForm } from "@/components/forms/PatientForm";
import { PasskeyModal } from "@/components/PasskeyModal";

type SearchParamProps = {
  searchParams: { [key: string]: string | undefined };
};

const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal />}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image
            src="/assets/icons/logo-full3.png"
            height={1000}
            width={1000}
            alt="VitalTrack Logo"
            className=" mb-12 h-34 w-42 mx-auto"
          />
          

          {/* 🟢 Patient Login Form */}
          <PatientForm />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="text-dark-600">© 2025 VitalTrack</p>
            <Link href="/?admin=true" className="font-bold hover:text-green-300 underline">
              Admin
            </Link>
            <Link href="/doctor/login" className="font-bold hover:text-red-500 underline">
              Doctor Login
            </Link>
          </div>
        </div>
      </section>

      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="Onboarding Illustration"
        className="side-img max-w-[50%]"
      />
    </div>
  );
};

export default Home;
