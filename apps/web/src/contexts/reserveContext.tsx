"use client";
// import getReserve from "@/actions/reserve/get-reserve";
import { useToast } from "@/hooks/use-toast";
import {
  getReservesByDayFetch,
  getAvailableTurnsByDay,
  getAvailableTurnsByHour,
  TurnByDay,
  TurnByHour,
  ReservesByDay,
} from "@/services/reserves/reserves";
// import { ReservaAgrupada, Turno } from "@/types";
import converDate from "@/utils/convertDate";
import dateLocal from "@/utils/dateLocal";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

type ThemeContext = {
  //state
  reserveForm: ReserveForm;
  setReserveForm: Dispatch<SetStateAction<ReserveForm>>;
  handleReserveForm: (step: string, data: Date | string | number) => void;
  // reserves

  // allReserves: ReservaAgrupada[] | undefined;
  availableReservesByDay: TurnByDay | null | undefined;
  availableReservesByHour: TurnByHour | null | undefined;
  reservesByDay: ReservesByDay | null | undefined;

  // get-reserves

  // getAllReserves: () => Promise<void>;
  getAvailableReservesByDay: (day: string) => Promise<void>;
  getAvailableReservesByHour: (day: string, schedule: string) => Promise<void>;
  getReservesByDay: (day: string) => Promise<void>;

  //stepper
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
};

type ReserveForm = {
  day: Date;
  hour: string;
  field: number;
};

const NUMBER_OF_STEPS = 4;

const ReserveContext = createContext<ThemeContext | null>(null);

export const useReserve = () => {
  const context = useContext(ReserveContext);

  if (!context)
    throw new Error("UseReserve must be used within a ReserveProvider");
  return context;
};

export const ReserveProvider = ({ children }: ModalProviderProps) => {
  // Reserve state
  const [reserveForm, setReserveForm] = useState<ReserveForm>({
    day: dateLocal(),
    hour: "",
    field: 0,
  });

  //Reserve stepper
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const goToNextStep = () =>
    setCurrentStep((prev) => (prev === NUMBER_OF_STEPS - 1 ? prev : prev + 1));
  const goToPreviousStep = () =>
    setCurrentStep((prev) => (prev <= 0 ? prev : prev - 1));

  useEffect(() => {
    // getAllReserves();
    if (localStorage.getItem("court")) {
      setReserveForm({
        day: converDate(localStorage.getItem("date")!),
        field: parseInt(localStorage.getItem("court")!),
        hour: localStorage.getItem("schedule")!,
      });
      setCurrentStep(3);
      // eliminar y setear el formulario
      localStorage.removeItem("court");
      localStorage.removeItem("date");
      localStorage.removeItem("schedule");
      localStorage.removeItem("phone");
    }
  }, []);

  // calendario
  // const [allReserves, setAllReserves] = useState<ReservaAgrupada[]>();
  // horarios

  const [reservesByDay, setReservesByDay] = useState<ReservesByDay | null>();

  const [availableReservesByDay, setavailableReservesByDay] =
    useState<TurnByDay | null>();
  // canchas
  const [availableReservesByHour, setavailableReservesByHour] =
    useState<TurnByHour | null>();

  const handleReserveForm = (step: string, data: Date | string | number) => {
    if (step == "field" && (!reserveForm.hour || !reserveForm.day)) {
      toast({
        variant: "destructive",
        title: "¡Ha ocurrido un error!",
        description: "Debes completar todos los campos antes de pasar al pago",
      });
      return undefined;
    }
    goToNextStep();
    setReserveForm((prevForm) => ({ ...prevForm, [step]: data }));
  };

  // const getAllReserves = async () => {
  //   const reserves = await getReserve();
  //   setAllReserves(reserves);
  // };

  const getAvailableReservesByDay = async (date: string) => {
    const schedules = await getAvailableTurnsByDay(date);
    setavailableReservesByDay(schedules);
  };

  const getReservesByDay = async (date: string) => {
    const schedules = await getReservesByDayFetch(date);
    setReservesByDay(schedules);
  };

  const getAvailableReservesByHour = async (date: string, schedule: string) => {
    const schedules = await getAvailableTurnsByHour(date, schedule);
    setavailableReservesByHour(schedules);
  };

  return (
    <ReserveContext.Provider
      value={{
        reserveForm,
        setReserveForm,
        handleReserveForm,
        // allReserves,
        availableReservesByDay,
        availableReservesByHour,
        reservesByDay,
        getAvailableReservesByDay,
        getAvailableReservesByHour,
        getReservesByDay,
        // getAllReserves,
        // filterByDay,
        // filterByHour,
        goToNextStep,
        goToPreviousStep,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </ReserveContext.Provider>
  );
};
