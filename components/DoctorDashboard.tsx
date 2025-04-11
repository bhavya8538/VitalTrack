"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getRecentAppointmentList,
  updateAppointmentNotes,
  updateAppointment,
  updateAppointmentStatus
} from "@/lib/actions/appointment.actions";
import { listPatients } from "@/lib/actions/patient.actions";
import { Appointment, Patient } from "@/types/appwrite.types";
import { Doctors } from "@/constants";

import Image from "next/image";

// Type Definitions

type EnrichedAppointment = Appointment & {
  patientName?: string;
};

type GroupedAppointments = Record<
  string,
  {
    patient: Patient;
    past: EnrichedAppointment[];
    upcoming: EnrichedAppointment[];
  }
>;

// Component

const DoctorDashboard = () => {
  const searchParams = useSearchParams();
  const doctorName = searchParams.get("name");
  const router = useRouter();

  const [groupedAppointments, setGroupedAppointments] = useState<GroupedAppointments>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<EnrichedAppointment | null>(null);
  const [notesText, setNotesText] = useState("");

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDateTime, setNewDateTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [apptData, patientData] = await Promise.all([
        getRecentAppointmentList(),
        listPatients(doctorName || undefined),
      ]);

      if (apptData?.documents && patientData?.documents) {
        const patientDocs = patientData.documents as Patient[];
        const assignedPatientIds = new Set(patientDocs.map((p) => p.$id));
        const now = new Date();
        const grouped: GroupedAppointments = {};

        apptData.documents.forEach((raw) => {
          const appt = raw as EnrichedAppointment;
          const patientId = appt.patient?.$id;
          if (!patientId || !assignedPatientIds.has(patientId)) return;

          const patient = patientDocs.find((p) => p.$id === patientId);
          if (!patient) return;

          const enrichedAppt = {
            ...appt,
            patientName: patient.name,
          };

          const scheduleTime = new Date(appt.schedule);
          const isUpcoming = scheduleTime >= now;

          if (!grouped[patientId]) {
            grouped[patientId] = {
              patient,
              past: [],
              upcoming: [],
            };
          }

          if (isUpcoming) {
            grouped[patientId].upcoming.push(enrichedAppt);
          } else {
            grouped[patientId].past.push(enrichedAppt);
          }
        });

        for (const patient of Object.values(grouped)) {
          patient.upcoming.sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime());
          patient.past.sort((a, b) => new Date(b.schedule).getTime() - new Date(a.schedule).getTime());
        }

        setGroupedAppointments(grouped);
      }
    };

    if (doctorName) fetchData();
  }, [doctorName]);

  const doctor = Doctors.find((doc) => doc.name === doctorName);
  const doctorImageUrl = doctor?.image || "/assets/images/default-avatar.png";

  const filterAppointments = (list: EnrichedAppointment[]) => {
    return list.filter((appt) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "completed") return appt.note?.toLowerCase() === "completed";
      return appt.note?.toLowerCase() !== "completed";
    });
  };
  

  const markAsCompleted = async (appointmentId: string) => {
    try {
      // 1. Update note to "completed"
      await updateAppointmentNotes(appointmentId, "completed");
  
      // 2. ALSO update the status to "Scheduled"
      await updateAppointmentStatus(appointmentId, "completed");

  
      // 3. Reflect changes in UI
      setGroupedAppointments((prev) => {
        const updated = { ...prev };
        for (const group of Object.values(updated)) {
          const all = [...group.upcoming, ...group.past];
          const match = all.find((a) => a.$id === appointmentId);
          if (match) {
            match.note = "completed";
            match.status = "completed";

          }
        }
        return updated;
      });
  
      alert("Appointment marked as completed!");
    } catch (err) {
      alert("Failed to mark as completed.");
      console.error(err);
    }
  };
  
  
  

  const cancelAppointment = (appointmentId: string) => {
    console.log(`Cancelling appointment ${appointmentId}`);
    // TODO: Implement API call
  };

  const rescheduleAppointment = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    setNewDateTime(appointment.schedule.toString());
    setShowRescheduleModal(true);
  };

  const openNotesModal = (appointment: EnrichedAppointment) => {
    setSelectedAppointment(appointment);
    setNotesText(appointment.note || "");
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (selectedAppointment) {
      try {
        await updateAppointmentNotes(selectedAppointment.$id, notesText);
        setGroupedAppointments((prev) => {
          const updated = { ...prev };
          for (const group of Object.values(updated)) {
            const all = [...group.upcoming, ...group.past];
            const match = all.find((a) => a.$id === selectedAppointment.$id);
            if (match) match.note = notesText;
          }
          return updated;
        });
        setShowNotesModal(false);
        alert("Notes saved!");
      } catch {
        alert("Failed to save notes.");
      }
    }
  };

  const saveReschedule = async () => {
    if (selectedAppointment && newDateTime) {
      try {
        await updateAppointment(selectedAppointment.$id, newDateTime);
        alert("Appointment rescheduled!");
        setShowRescheduleModal(false);
        location.reload();
      } catch {
        alert("Failed to reschedule. Try again.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Image src={doctorImageUrl} alt="Doctor Profile" width={50} height={50} className="rounded-full border shadow" />
          <h1 className="text-2xl font-bold">Welcome, Dr. {doctorName}</h1>
        </div>
        <button onClick={() => { localStorage.removeItem("doctorName"); router.push("/doctor/login"); }} className="text-bold text-red-400 hover:underline">
          Logout
        </button>
      </div>

      <div className="mb-4 flex gap-3 text-black">
        {["all", "pending", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as typeof statusFilter)}
            className={`px-4 py-1 rounded ${statusFilter === status ? (status === "pending" ? "bg-orange-500 text-white" : status === "completed" ? "bg-blue-500 text-white" : "bg-green-500 text-white") : "bg-gray-200"}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Patients & Appointments</h2>

      {Object.entries(groupedAppointments).length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([patientId, { patient, past, upcoming }]) => {
            const filteredUpcoming = filterAppointments(upcoming);
            const filteredPast = filterAppointments(past);

            const filteredCompleted = [...filteredUpcoming, ...filteredPast].filter(
              (appt) => appt.note?.toLowerCase() === "completed"
            );

            if (filteredUpcoming.length === 0 && filteredPast.length === 0) return null;

            return (
              <div key={patientId} className="p-4 bg-white rounded shadow">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-black">{patient.name}</h3>
                  <p className="text-sm text-gray-600">Email: {patient.email || "N/A"}</p>
                  <p className="text-sm text-gray-600">Phone: {patient.phone || "N/A"}</p>
                  <p className="text-sm text-gray-600">Medical Conditions: {patient.pastMedicalHistory || "None"}</p>
                </div>

                {filteredUpcoming.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-semibold text-green-600">Upcoming Appointments:</h4>
                    <div className="space-y-4">
                      {filteredUpcoming.map((appt) => (
                        <div key={appt.$id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                          <div className="text-black font-medium mb-1">
                            <span className="block">{new Date(appt.schedule).toLocaleString()}</span>
                            <span className="block text-gray-700">Reason: {appt.reason}</span>
                            <span className="block text-sm text-gray-600">Status: {appt.status}</span>
                            {appt.note && <span className="block text-sm text-green-700 mt-1">Notes: {appt.note}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <button className="text-blue-600 hover:underline" onClick={() => markAsCompleted(appt.$id)}>Mark as Completed</button>
                            <button className="text-purple-600 hover:underline" onClick={() => openNotesModal(appt)}>Add/View Notes</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPast.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-600">Past Appointments:</h4>
                    <div className="space-y-4">
                      {filteredPast.map((appt) => (
                        <div key={appt.$id} className="p-4 border rounded-lg bg-gray-50 shadow-sm opacity-90">
                          <div className="text-black font-medium mb-1">
                            <span className="block">{new Date(appt.schedule).toLocaleString()}</span>
                            <span className="block text-gray-700">Reason: {appt.reason}</span>
                            <span className="block text-sm text-gray-600">Status: {appt.status}</span>
                            {appt.note && <span className="block text-sm text-green-700 mt-1">Notes: {appt.note}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <button className="text-blue-600 hover:underline" onClick={() => markAsCompleted(appt.$id)}>Mark as Completed</button>
                            <button className="text-purple-600 hover:underline" onClick={() => openNotesModal(appt)}>View/Add Notes</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showNotesModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Consultation Notes</h3>
            <textarea
              className="w-full h-40 p-2 border rounded mb-4"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Enter notes or prescriptions..."
            />
            <div className="flex justify-end gap-3">
              <button className="text-sm px-4 py-1 bg-gray-300 rounded" onClick={() => setShowNotesModal(false)}>
                Cancel
              </button>
              <button className="text-sm px-4 py-1 bg-blue-600 text-white rounded" onClick={saveNotes}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-2">Reschedule Appointment</h2>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRescheduleModal(false)} className="text-gray-600 hover:underline">Cancel</button>
              <button onClick={saveReschedule} className="bg-blue-500 text-white px-4 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;