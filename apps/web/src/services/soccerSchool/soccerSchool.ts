export interface Student {
  id: string;
  name: string;
  age: number;
  plan: "monthly" | "weekly";
  lastPayment: string;
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Juan Pérez",
    age: 10,
    plan: "monthly",
    lastPayment: "2023-11-01",
  },
  {
    id: "2",
    name: "María Gómez",
    age: 8,
    plan: "weekly",
    lastPayment: "2023-11-15",
  },
];

export const getStudents = async (): Promise<Student[]> => {
  return mockStudents;
};

export const registerPayment = async (studentId: string, amount: number) => {
  console.log(`Pago registrado: ${studentId} - $${amount}`);
  return { success: true };
};
