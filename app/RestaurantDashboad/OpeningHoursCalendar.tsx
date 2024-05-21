import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { OpeningHourType } from '@/services/types';
import { getOpeningHours } from '@/services/apiService';
import { addDays, format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OpeningHoursCalendarProps {
  restaurantId: number;
}

const OpeningHoursCalendar: React.FC<OpeningHoursCalendarProps> = ({ restaurantId }) => {
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchOpeningHours = async () => {
      try {
        const data = await getOpeningHours(restaurantId);
        setOpeningHours(data);
        const closedDays = data.filter(hour => hour.is_closed).map(hour => getDateFromDay(hour.day));
        setHighlightedDates(closedDays);
      } catch (error) {
        console.error("Error fetching opening hours", error);
      }
    };
    fetchOpeningHours();
  }, [restaurantId]);

  const getDateFromDay = (day: number): Date => {
    const now = new Date();
    const start = startOfWeek(now, { locale: ptBR });
    return addDays(start, day);
  };

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
      <h3 className="text-xl font-bold mb-4">Horário de Funcionamento</h3>
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
            <span>{['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][hour.day]}</span>
            <span>{hour.is_closed ? "Fechado" : `${hour.from_hour} - ${hour.to_hour}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OpeningHoursCalendar;
