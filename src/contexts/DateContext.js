import { createContext, useState, useEffect, useContext } from "react";
import moment from "moment-timezone";

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    startDateTime: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    endDateTime: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  const handleDateChange = ({ startDateTime, endDateTime }) => {
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

export const useDate = () => useContext(DateContext);
