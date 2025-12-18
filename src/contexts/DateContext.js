"use client";

import { createContext, useState, useEffect, useContext } from "react";
import moment from "moment-timezone";

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    startDateTime: moment().tz("Asia/Kolkata").startOf("day").format("YYYY-MM-DD HH:mm"),
    endDateTime: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm"),
  });

  const handleDateChange = ({ startDateTime, endDateTime }) => {
    setDateRange((prev) => ({
      startDateTime: startDateTime || prev.startDateTime,
      endDateTime: endDateTime || prev.endDateTime,
    }));
  };

  useEffect(() => {
    console.log("📅 Start DateTime:", dateRange.startDateTime);
    console.log("📅 End DateTime:", dateRange.endDateTime);
  }, [dateRange]);

  return (
    <DateContext.Provider value={{ ...dateRange, handleDateChange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);
