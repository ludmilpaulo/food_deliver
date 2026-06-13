import React from 'react'
import { useTranslation } from "@/hooks/useTranslation";

type Props = {}

const Report = (props: Props) => {
  const { t } = useTranslation();
  return (
    <div>{t("report", "Report")}</div>
  )
}

export default Report