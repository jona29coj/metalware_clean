import { createContext, useState, useContext, ReactNode } from "react";
import moment from "moment-timezone";

interface DateRange {
  startDateTime: string;
  endDateTime: string;
}

interface DateChangeInput {
  startDateTime?: string;
  endDateTime?: string;
}

interface DateContextValue extends DateRange {
  handleDateChange: (input: DateChangeInput) => void;
}

export const DateContext = createContext<DateContextValue | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDateTime: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    endDateTime: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  const handleDateChange = ({ startDateTime, endDateTime }: DateChangeInput) => {
    setDateRange((prev) => ({
      startDateTime: startDateTime || prev.startDateTime,
      endDateTime: endDateTime || prev.endDateTime,
    }));
  };

  return (
    <DateContext.Provider value={{ ...dateRange, handleDateChange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
};
