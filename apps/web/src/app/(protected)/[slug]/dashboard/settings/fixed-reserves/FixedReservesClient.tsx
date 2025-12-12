"use client";

import { useEffect, useState } from "react";
import FixedScheduleForm from "./fixedReserveForm";
import EditFixedSchedules from "./editFixedReserves";
import { getUsers } from "@/services/user/user";
import { Complex } from "@/services/complex/complex";

interface FixedReservesClientProps {
  complex: Complex;
}

export default function FixedReservesClient({ complex }: FixedReservesClientProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getUsers();
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <FixedScheduleForm complex={complex} usersData={users} />
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <EditFixedSchedules complex={complex} />
      </div>
    </>
  );
}
