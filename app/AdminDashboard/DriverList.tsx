import React from 'react';
import { useTranslation } from "@/hooks/useTranslation";

const DriverList: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("drivers", "Drivers")}</h1>
      <p>{t("driversList", "Drivers list...")}</p>
    </div>
  );
};

export default DriverList;
