"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";

export type Status = "scheduled" | "pending" | "cancelled" | "completed";

type UpdateAppointmentParams = {
  userId: string;
  appointmentId: string;
  timeZone?: string;
  appointment: {
    primaryPhysician?: string;
    schedule?: Date;
    status?: Status;
    cancellationReason?: string;
    note?: string;
  };
  type: "schedule" | "cancel";
};

// CREATE APPOINTMENT
export const createAppointment = async (appointment: CreateAppointmentParams) => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

// GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const documents = appointments.documents.map((doc) => ({
      ...doc,
    })) as Appointment[];

    const counts = documents.reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "Scheduled":
            acc.scheduledCount++;
            break;
          case "Pending":
            acc.pendingCount++;
            break;
          case "Canceled":
            acc.cancelledCount++;
            break;
          case "Completed":
            acc.completedCount++;
            break;
        }
        return acc;
      },
      {
        scheduledCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        completedCount: 0,
      }
    );

    return {
      totalCount: appointments.total,
      ...counts,
      documents: documents,
    };
  } catch (error) {
    console.error("Error retrieving recent appointments:", error);
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: [],
    };
  }
};

// GET SINGLE APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );
    return parseStringify(appointment);
  } catch (error) {
    console.error("Error retrieving appointment:", error);
  }
};

// GET PATIENT-SPECIFIC APPOINTMENTS
export const getAppointmentsByPatient = async (patientId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("patientId", patientId),
        Query.orderDesc("$createdAt"),
      ]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return [];
  }
};

// SEND SMS
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

// UPDATE APPOINTMENT (SCHEDULE/CANCEL)
export const updateAppointment = async ($id: string, newDateTime: string, {
  appointmentId, userId, timeZone, appointment, type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );

    if (!updatedAppointment) throw Error;

    const message = `Greetings from VitalTrack. ${
      type === "schedule"
        ? `Your appointment is confirmed for ${formatDateTime(
            appointment.schedule!,
            timeZone
          ).dateTime} with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform that your appointment for ${formatDateTime(
            appointment.schedule!,
            timeZone
          ).dateTime} is cancelled. Reason: ${appointment.cancellationReason}`
    }.`;

    await sendSMSNotification(userId, message);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
  }
};

// UPDATE CONSULTATION NOTES (AND OPTIONAL STATUS)
export const updateAppointmentNotes = async (
  appointmentId: string,
  notes: string,
  status?: string
) => {
  try {
    const updatePayload: any = { note: notes };
    if (status) updatePayload.status = status;

    const updated = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      updatePayload
    );

    revalidatePath("/admin");
    return parseStringify(updated);
  } catch (error) {
    console.error("Error updating notes:", error);
  }
};

// RESCHEDULE APPOINTMENT
export const rescheduleAppointmentById = async (
  appointmentId: string,
  newSchedule: string
) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      { schedule: newSchedule }
    );

    revalidatePath("/admin");
    return parseStringify(updated);
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
  }
};

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  try {
    const response =  await databases.updateDocument(
      DATABASE_ID!, // <-- add "!"
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      { status }
    );
    return response;
    
  } catch (err) {
    console.error("Failed to update status:", err);
    throw err;
  }
}


