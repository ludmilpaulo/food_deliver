import React, { useState, ChangeEvent } from "react";
import { OpeningHourType } from "@/services/types";
import { createOpeningHour } from "@/services/apiService";
import { useTranslation } from "@/hooks/useTranslation";

const validTimes = Array.from({ length: 24 }, (_, h) =>
  [`${h % 12 === 0 ? 12 : h % 12 < 10 ? `0${h % 12}` : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`, `${h % 12 === 0 ? 12 : h % 12 < 10 ? `0${h % 12}` : h % 12}:30 ${h < 12 ? 'AM' : 'PM'}`]
).flat();

interface OpeningHourProps {
  storeId: number;
  openingHours: OpeningHourType[];
  setOpeningHours: React.Dispatch<React.SetStateAction<OpeningHourType[]>>;
}

const OpeningHour: React.FC<OpeningHourProps> = ({ storeId, openingHours, setOpeningHours }) => {
  const { t } = useTranslation();
  const dayLabels = [
    t("sunday", "Sunday"),
    t("monday", "Monday"),
    t("tuesday", "Tuesday"),
    t("wednesday", "Wednesday"),
    t("thursday", "Thursday"),
    t("friday", "Friday"),
    t("saturday", "Saturday"),
  ];
  const [newOpeningHour, setNewOpeningHour] = useState<OpeningHourType>({
    store: storeId,
    day: 1,
    from_hour: "",
    to_hour: "",
    is_closed: false,
  });

  const handleNewOpeningHourChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOpeningHour((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOpeningHour = async () => {
    try {
      const newHour = await createOpeningHour(storeId, newOpeningHour);
      setOpeningHours([...openingHours, newHour]);
      setNewOpeningHour({
        store: storeId,
        day: 1,
        from_hour: "",
        to_hour: "",
        is_closed: false,
      });
    } catch (error) {
      console.error("Error adding opening hour", error);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">{t("openingHours", "Opening Hours")}</h3>
      <ul className="mt-2 space-y-2">
        {openingHours.map((hour, index) => (
          <li key={index} className="flex justify-between">
            <span>{dayLabels[hour.day - 1]}</span>
            <span>{hour.is_closed ? t("closed", "Closed") : `${hour.from_hour} - ${hour.to_hour}`}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h4 className="text-lg font-semibold">{t("addNewSchedule", "Add New Schedule")}</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium">{t("day", "Day")}</label>
            <select
              name="day"
              value={newOpeningHour.day}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">{t("selectDay", "Select a day")}</option>
              <option value="1">{t("monday", "Monday")}</option>
              <option value="2">{t("tuesday", "Tuesday")}</option>
              <option value="3">{t("wednesday", "Wednesday")}</option>
              <option value="4">{t("thursday", "Thursday")}</option>
              <option value="5">{t("friday", "Friday")}</option>
              <option value="6">{t("saturday", "Saturday")}</option>
              <option value="7">{t("sunday", "Sunday")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">{t("startTime", "Start Time")}</label>
            <select
              name="from_hour"
              value={newOpeningHour.from_hour}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">{t("selectTime", "Select a time")}</option>
              {validTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">{t("endTime", "End Time")}</label>
            <select
              name="to_hour"
              value={newOpeningHour.to_hour}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">{t("selectTime", "Select a time")}</option>
              {validTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_closed"
              checked={newOpeningHour.is_closed}
              onChange={(e) => setNewOpeningHour({ ...newOpeningHour, is_closed: e.target.checked })}
            />
            <label className="text-sm font-medium">{t("closed", "Closed")}</label>
          </div>
          <button
            onClick={handleAddOpeningHour}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            {t("add", "Add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningHour;
