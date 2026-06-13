import React from 'react'
import { useTranslation } from "@/hooks/useTranslation";

type Props = {}

const CustomersList = (props: Props) => {
  const { t } = useTranslation();
  return (
    <div>{t("customersList", "Customers List")}</div>
  )
}

export default CustomersList