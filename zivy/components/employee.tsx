import React from "react";

import { TUser } from "@/interfaces/employee";

import EmployeeStyles from "./styles/employeeStyles";

interface TProps {
  user?: TUser;
  loading?: boolean;
}

const Employee = ({ user, loading }: TProps) => {
  return (
    <EmployeeStyles loading={loading}>
      {user ? user.id : "isLoading..."}
    </EmployeeStyles>
  );
};

export default Employee;
