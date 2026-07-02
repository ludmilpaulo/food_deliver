import React, { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { fetchPartnerReportCustomers } from "@/features/partner/api/partnerReportsApi";
import { baseAPI } from "@/services/types";
import { useTranslation } from "@/hooks/useTranslation";

interface Customer {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
  total_orders?: number;
}

const CustomersList: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetchPartnerReportCustomers();
      setCustomers(response as Customer[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="h-full w-full">
      <div className="overflow-scroll px-0">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t("name", "Name")}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">{t("phone", "Phone")}</div>
              </th>
              <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                <div className="font-normal leading-none opacity-70">
                  {t("address", "Address")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="p-4 border-b border-blue-gray-50"
              >
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 rounded-full overflow-hidden w-10 h-10">
                      {customer.avatar ? (
                        <Image
                          src={customer.avatar.startsWith('http') ? customer.avatar : `${baseAPI}${customer.avatar}`}
                          alt={customer.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          {customer.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-normal">{customer.name}</div>
                    </div>
                  </div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{customer.phone}</div>
                </td>
                <td className="border-y border-blue-gray-100 p-4">
                  <div className="font-normal">{customer.address}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersList;
