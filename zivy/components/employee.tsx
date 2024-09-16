import React from "react";

import { TUser } from "@/interfaces/employee";

// import EmployeeStyles from "./styles/employeeStyles";

interface TProps {
  user: TUser;
}

const Employee = ({ user }: TProps) => {
  return <div>{user.id}</div>;
};

export default Employee;
