"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Doctors } from "@/constants";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";

const DoctorLogin = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const doctor = Doctors.find((doc) => doc.name === selectedDoctor);
    if (doctor && doctor.password === password) {
      router.push(`/doctor/dashboard?name=${encodeURIComponent(doctor.name)}`);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Link href="/" className="cursor-pointer mb-4">
        <Image
            src="/assets/icons/logo-full3.png"
            className="-mt-0 mb-10 h-50 w-fit mx-auto"
            alt="logo"
            width={250}
            height={100}
        />
        </Link>

        <div className="bg-white p-8 shadow rounded w-full max-w-md">
            <h2 className="text-center  text-black text-lg font-bold mb-4">Doctor Login</h2>
        <Select onValueChange={setSelectedDoctor}>
          <SelectTrigger className="w-full border px-3 py-2">
            <SelectValue placeholder="Select Doctor" />
          </SelectTrigger>
          <SelectContent>
            {Doctors.map((doc) => (
              <SelectItem key={doc.name} value={doc.name}>
                <div className="flex items-center gap-2">
                  <Image src={doc.image} alt={doc.name} width={32} height={32} className="rounded-full" />
                  <span>{doc.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="password"
          className="w-full mt-4 p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        
      </div>
      <p className="copyright  mt-12 -mb-8 py-16">© 2025 VitalTrack</p>
    </div>
  );
};

export default DoctorLogin;
