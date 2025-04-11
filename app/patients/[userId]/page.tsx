// ... (imports and types stay the same)

import { Appointment } from "@/constants";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { notFound } from "next/navigation";

export default async function PatientPage({ params }: { params: { userId: string } }) {
    const patient = await getPatientById(params.userId);
    const apptData = await getRecentAppointmentList();
  
    if (!patient) return notFound();
  
    const now = new Date();
    const appointments = (apptData?.documents || []) as Appointment[];
  
    const enrichedAppointments: EnrichedAppointment[] = appointments
      .filter((appt) => appt.patient?.$id === patient.$id)
      .map((appt) => ({
        ...appt,
        patientName: patient.name,
      }));
  
    const upcoming = enrichedAppointments
      .filter((appt) => new Date(appt.schedule) >= now && appt.status === "Scheduled")
      .sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());
  
    const completed = enrichedAppointments
      .filter((appt) => appt.status === "Completed")
      .sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());
  
    const cancelled = enrichedAppointments
      .filter((appt) => appt.status === "Canceled")
      .sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());
  
    const pastScheduled = enrichedAppointments
      .filter(
        (appt) =>
          new Date(appt.schedule) < now &&
          appt.status === "Scheduled"
      )
      .sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());
    
  
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Patient: {patient.name}</h1>
  
        {upcoming.length === 0 &&
        completed.length === 0 &&
        cancelled.length === 0 &&
        pastScheduled.length === 0 ? (
          <p className="text-gray-500">No appointments found for this patient.</p>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-green-600">Upcoming Appointments</h2>
                <ul className="list-disc list-inside mt-2">
                  {upcoming.map((appt) => (
                    <li key={appt.$id}>
                      {new Date(appt.schedule).toLocaleString()} – {appt.reason} ({appt.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {completed.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-blue-600">Completed Appointments</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                  {completed.map((appt) => (
                    <li key={appt.$id}>
                      {new Date(appt.schedule).toLocaleString()} – {appt.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {cancelled.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-red-600">Canceled Appointments</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                  {cancelled.map((appt) => (
                    <li key={appt.$id}>
                      {new Date(appt.schedule).toLocaleString()} – {appt.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {pastScheduled.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Past (Unmarked) Appointments</h2>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-500">
                  {pastScheduled.map((appt) => (
                    <li key={appt.$id}>
                      {new Date(appt.schedule).toLocaleString()} – {appt.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  