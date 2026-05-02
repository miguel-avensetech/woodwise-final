export type BookingStatus = "new" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high";
export type NotificationKind = "booking" | "repair" | "maintenance";
export type NotificationState = "new" | "updated" | "overdue";

export interface OfficeBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  furniture: string;
  issue: string;
  requestedDate: string;
  status: BookingStatus;
  priority: Priority;
}

export interface OfficeAppointment {
  id: string;
  bookingId: string;
  customerName: string;
  furniture: string;
  startTime: string;
  endTime: string;
  type: "inspection" | "repair" | "maintenance";
}

export interface OfficeRepairTask {
  id: string;
  bookingId: string;
  title: string;
  assignee: string;
  dueAt: string;
  status: "unassigned" | "assigned" | "in_progress" | "blocked" | "done";
  slaRisk: "ok" | "overdue_24h" | "unassigned";
}

export interface OfficeFollowUp {
  id: string;
  customerName: string;
  furniture: string;
  dueAt: string;
  reason: "post_repair" | "maintenance";
  sentiment: "positive" | "neutral" | "negative";
}

export interface OfficeNotification {
  id: string;
  kind: NotificationKind;
  state: NotificationState;
  title: string;
  message: string;
  customerName: string;
  furniture: string;
  createdAt: string;
  unread: boolean;
}

export const officeBookings: OfficeBooking[] = [
  {
    id: "BK-1001",
    customerName: "Jessa Rosellosa",
    customerPhone: "+63 917 100 2001",
    furniture: "Dining Table",
    issue: "Surface discoloration and shallow scratches",
    requestedDate: "2026-05-04T09:00:00.000Z",
    status: "new",
    priority: "medium",
  },
  {
    id: "BK-1002",
    customerName: "Miguel Rivera",
    customerPhone: "+63 917 100 2002",
    furniture: "Office Chair",
    issue: "Loose leg and worn finish",
    requestedDate: "2026-05-04T13:00:00.000Z",
    status: "confirmed",
    priority: "high",
  },
  {
    id: "BK-1003",
    customerName: "Ana Villanueva",
    customerPhone: "+63 917 100 2003",
    furniture: "Display Chair",
    issue: "Minor crack on front panel",
    requestedDate: "2026-05-05T10:30:00.000Z",
    status: "in_progress",
    priority: "high",
  },
];

export const officeAppointments: OfficeAppointment[] = [
  {
    id: "AP-2001",
    bookingId: "BK-1002",
    customerName: "Miguel Rivera",
    furniture: "Office Chair",
    startTime: "2026-05-02T01:00:00.000Z",
    endTime: "2026-05-02T02:00:00.000Z",
    type: "repair",
  },
  {
    id: "AP-2002",
    bookingId: "BK-1003",
    customerName: "Ana Villanueva",
    furniture: "Display Chair",
    startTime: "2026-05-02T03:30:00.000Z",
    endTime: "2026-05-02T04:30:00.000Z",
    type: "inspection",
  },
  {
    id: "AP-2003",
    bookingId: "BK-1001",
    customerName: "Jessa Rosellosa",
    furniture: "Dining Table",
    startTime: "2026-05-03T01:00:00.000Z",
    endTime: "2026-05-03T02:00:00.000Z",
    type: "maintenance",
  },
];

export const officeRepairTasks: OfficeRepairTask[] = [
  {
    id: "RT-3001",
    bookingId: "BK-1003",
    title: "Stabilize cabinet panel crack",
    assignee: "Unassigned",
    dueAt: "2026-05-03T07:00:00.000Z",
    status: "unassigned",
    slaRisk: "unassigned",
  },
  {
    id: "RT-3002",
    bookingId: "BK-1002",
    title: "Chair leg reinforcement",
    assignee: "Arman Padilla",
    dueAt: "2026-05-02T09:00:00.000Z",
    status: "in_progress",
    slaRisk: "ok",
  },
  {
    id: "RT-3003",
    bookingId: "BK-0999",
    title: "Table top refinishing",
    assignee: "Paolo Santos",
    dueAt: "2026-05-01T08:00:00.000Z",
    status: "blocked",
    slaRisk: "overdue_24h",
  },
];

export const officeFollowUps: OfficeFollowUp[] = [
  {
    id: "FU-4001",
    customerName: "Lia Santos",
    furniture: "Bed Frame",
    dueAt: "2026-05-02T06:00:00.000Z",
    reason: "post_repair",
    sentiment: "positive",
  },
  {
    id: "FU-4002",
    customerName: "Mark De Guzman",
    furniture: "Bookshelf",
    dueAt: "2026-05-02T08:30:00.000Z",
    reason: "maintenance",
    sentiment: "neutral",
  },
  {
    id: "FU-4003",
    customerName: "Reena Cruz",
    furniture: "Dining Chair Set",
    dueAt: "2026-05-03T02:00:00.000Z",
    reason: "post_repair",
    sentiment: "negative",
  },
];

export const officeNotifications: OfficeNotification[] = [
  {
    id: "NT-5001",
    kind: "booking",
    state: "new",
    title: "New repair booking",
    message: "Customer requested onsite inspection for a dining table.",
    customerName: "Jessa Rosellosa",
    furniture: "Dining Table",
    createdAt: "2026-05-02T00:15:00.000Z",
    unread: true,
  },
  {
    id: "NT-5002",
    kind: "repair",
    state: "updated",
    title: "Repair status updated",
    message: "Chair leg reinforcement marked in-progress by Tech Arman.",
    customerName: "Miguel Rivera",
    furniture: "Office Chair",
    createdAt: "2026-05-02T02:45:00.000Z",
    unread: true,
  },
  {
    id: "NT-5003",
    kind: "maintenance",
    state: "overdue",
    title: "Maintenance follow-up overdue",
    message: "Post-repair follow-up has exceeded SLA by 24h.",
    customerName: "Reena Cruz",
    furniture: "Dining Chair Set",
    createdAt: "2026-05-01T07:30:00.000Z",
    unread: false,
  },
];

export const officeTechnicianAvailability = [
  { name: "Arman Padilla", status: "On Field", slot: "09:00 - 16:00" },
  { name: "Paolo Santos", status: "Workshop", slot: "08:00 - 17:00" },
  { name: "Mira De Leon", status: "Available", slot: "10:00 - 18:00" },
];

export function getOfficeUnreadCount(): number {
  return officeNotifications.filter((item) => item.unread).length;
}

