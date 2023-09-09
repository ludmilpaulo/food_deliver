import React, { ReactNode } from "react";
import Image from "next/image";


type FornecedorLayoutProps = {
  user: User;
  fornecedor: FornecedorType | null;
  children?: React.ReactNode;
};
// ... rest of the code ...

type UserType = {
  user_id?: number;
  username: string;
  // ... any other properties that 'user' might have ...
};

type FornecedorType = {
  id: number;
  usuario: number;
  nome_fornecedor: string;
  telefone: string;
  endereco: string;
  logo: string;
  licenca: string;
  aprovado: boolean;
  criado_em: string;
  modificado_em: string;
  children: ReactNode;
};

const RestaurantLayout: React.FC<FornecedorLayoutProps> = ({
  user,
  fornecedor,
  children,
}) => {
  // Your component logic here

  return (
    <div className="relative h-full">
      {" "}
      {/* Adjust the height as needed */}
      {fornecedor && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={fornecedor.logo}
            layout="fill"
            objectFit="cover" // This ensures the image covers the entire div
            alt={fornecedor.nome_fornecedor}
            className="absolute z-0"
          />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default RestaurantLayout;
