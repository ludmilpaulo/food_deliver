import React, { useState, ChangeEvent } from "react";
import { OpeningHourType } from "@/services/types";
import { createOpeningHour } from "@/services/apiService";

interface OpeningHourProps {
  restaurantId: number;
  openingHours: OpeningHourType[];
  setOpeningHours: React.Dispatch<React.SetStateAction<OpeningHourType[]>>;
}

const OpeningHour: React.FC<OpeningHourProps> = ({ restaurantId, openingHours, setOpeningHours }) => {
  const [newOpeningHour, setNewOpeningHour] = useState<OpeningHourType>({
    restaurant: restaurantId,
    day: 1, // Set default to 1 (Monday)
    from_hour: "",
    to_hour: "",
    is_closed: false,
  });

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const minuteNum = parseInt(minute, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')} ${period}`;
  };

  const handleNewOpeningHourChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOpeningHour((prev) => ({
      ...prev,
      [name]: name.includes('hour') ? formatTime(value) : parseInt(value, 10),
    }));
  };

  const handleAddOpeningHour = async () => {
    try {
      const formattedOpeningHour = {
        ...newOpeningHour,
        from_hour: formatTime(newOpeningHour.from_hour),
        to_hour: formatTime(newOpeningHour.to_hour),
      };
      console.log("Formatted opening hour data:", formattedOpeningHour);
      const newHour = await createOpeningHour(restaurantId, formattedOpeningHour);
      setOpeningHours([...openingHours, newHour]);
      setNewOpeningHour({
        restaurant: restaurantId,
        day: 1, // Reset to default day (Monday)
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
      <h3 className="text-xl font-bold">Horário de Funcionamento</h3>
      <ul className="mt-2 space-y-2">
        {openingHours.map((hour, index) => (
          <li key={index} className="flex justify-between">
            <span>{['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][hour.day - 1]}</span>
            <span>{hour.is_closed ? "Fechado" : `${hour.from_hour} - ${hour.to_hour}`}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h4 className="text-lg font-semibold">Adicionar Novo Horário</h4>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium">Dia</label>
            <select
              name="day"
              value={newOpeningHour.day}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">Selecione um dia</option>
              <option value="1">Segunda-feira</option>
              <option value="2">Terça-feira</option>
              <option value="3">Quarta-feira</option>
              <option value="4">Quinta-feira</option>
              <option value="5">Sexta-feira</option>
              <option value="6">Sábado</option>
              <option value="7">Domingo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Hora de Início</label>
            <input
              type="time"
              name="from_hour"
              value={newOpeningHour.from_hour}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Hora de Término</label>
            <input
              type="time"
              name="to_hour"
              value={newOpeningHour.to_hour}
              onChange={handleNewOpeningHourChange}
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_closed"
              checked={newOpeningHour.is_closed}
              onChange={(e) => setNewOpeningHour({ ...newOpeningHour, is_closed: e.target.checked })}
            />
            <label className="text-sm font-medium">Fechado</label>
          </div>
          <button
            onClick={handleAddOpeningHour}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpeningHour;
