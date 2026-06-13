import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { OpeningHourType } from '@/services/types';
import { getOpeningHours } from '@/services/apiService';
import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from "@/hooks/useTranslation";

interface OpeningHoursCalendarProps {
  storeId: number;
}

const getDateFromDay = (day: number): Date => {
  const now = new Date();
  const start = startOfWeek(now, { locale: ptBR });
  return addDays(start, day);
};

const OpeningHoursCalendar: React.FC<OpeningHoursCalendarProps> = ({ storeId }) => {
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
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const data = await getOpeningHours(storeId);
        setOpeningHours(data);
        const closedDays = data.filter(hour => hour.is_closed).map(hour => getDateFromDay(hour.day));
        setHighlightedDates(closedDays);
      } catch (error) {
        console.error("Error fetching opening hours", error);
      }
    };
    fetchOpeningHours();
  }, [storeId]);

  const tileClassName = ({ date }: { date: Date }) => {
    return highlightedDates.some(
      highlightedDate =>
        date.getFullYear() === highlightedDate.getFullYear() &&
        date.getMonth() === highlightedDate.getMonth() &&
        date.getDate() === highlightedDate.getDate()
    )
      ? 'highlight'
      : '';
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">{t("openingHours", "Opening Hours")}</h3>
      <Calendar
        locale="pt-BR"
        tileClassName={tileClassName}
      />
      <style jsx>{`
        .highlight {
          background: red;
          color: white;
        }
      `}</style>
      <ul className="mt-4 space-y-2">
        {openingHours.map((hour, index) => (
          <li key={index} className="flex justify-between">
            <span>{dayLabels[hour.day]}</span>
            <span>{hour.is_closed ? t("closed", "Closed") : `${hour.from_hour} - ${hour.to_hour}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OpeningHoursCalendar;
