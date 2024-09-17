import styled from "styled-components";

const EmployeeStyles = styled.div<{ loading: boolean | undefined }>`
  width: 10vw;
  margin-bottom: 1vh;
  padding: 1vh 1vw;
  color: black;
  font-size: 1rem;
  background-color: rgb(219 112 124);
  background: ${({ loading }) => (loading ? "gray" : "rgb(219 112 124)")};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
`;

export default EmployeeStyles;
