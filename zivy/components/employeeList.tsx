import React, { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TUser } from "@/interfaces/employee";

import Employee from "./employee";
import EmployeeListStyles from "./styles/employeeListStyles";

const INITIAL_URL = "https://api.github.com/orgs/mozilla/members";

const saveToLocalStorage = (data: TUser[], nextLink: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userData", JSON.stringify(data));
    nextLink && localStorage.setItem("nextLink", nextLink);
    console.log("Data saved to localStorage!");
  }
};

const getDataFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const savedItems = localStorage.getItem("userData");
    const next = localStorage.getItem("nextLink");

    if (savedItems) {
      return { savedItems: JSON.parse(savedItems) as TUser[], next: next };
    }
  }
};

const EmployeeList = () => {
  const [userListData, setUserListData] = useState<{
    userList: TUser[];
    isLoading: boolean;
    isError: boolean;
  }>({
    userList: [],
    isLoading: false,
    isError: false,
  });
  const lastUserRef = useRef<any>(null);
  //used a ref instead of state to prevent unnecessary rerendering due to this state change
  const nextLink = useRef<any>(null);
  //   const [nextLink, setNextLink] = useState<string | undefined>(undefined)

  //Get Users API
  const getUsers = async (url: string) => {
    try {
      setUserListData((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch(url, {
        headers: {
          Authorization: `${process.env.TOKEN}`,
        },
      });

      //check if next page exists
      const linkHeader = response?.headers.get("Link");
      const next = linkHeader
        ?.split(",")
        .find((link) => link.includes('rel="next"'));
      if (next) {
        const nextUrl = next.match(/<([^>]+)>/)![1];
        nextLink.current = nextUrl;
      } else {
        nextLink.current = null;
      }

      //setting localuser state
      const json = await response?.json();
      setUserListData((prev) => ({
        ...prev,
        isLoading: false,
        userList: [...prev.userList, ...json],
      }));
    } catch (error) {
      setUserListData((prev) => ({ ...prev, isLoading: false, isError: true }));
      console.log("error", error);
    }
  };

  //to update local state to localStorage
  useEffect(() => {
    userListData.userList.length > 0 &&
      saveToLocalStorage(userListData.userList, nextLink.current);
  }, [userListData.userList]);

  //code to check if the last ref is intersecting
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log(nextLink.current);
          nextLink.current && getUsers(nextLink.current);
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px", // no margin
        threshold: 0.5, // 50% of target visible
      }
    );

    if (lastUserRef.current) {
      observer.observe(lastUserRef.current);
    }
    // Clean up the observer
    return () => {
      if (lastUserRef.current) {
        observer.unobserve(lastUserRef.current);
      }
    };
  }, [nextLink.current]);

  // Load data from localStorage or make the initial API call
  useEffect(() => {
    const prevSavedData = getDataFromLocalStorage();
    if (prevSavedData?.savedItems) {
      setUserListData((prev) => ({
        ...prev,
        userList: prevSavedData?.savedItems,
      }));
      nextLink.current = prevSavedData.next;
    } else {
      getUsers(`${INITIAL_URL}?page=${1}`);
    }
  }, []);

  return (
    <EmployeeListStyles>
      {userListData.userList?.map((user: TUser) => {
        return <Employee key={user.id} user={user} />;
      })}
      <div
        className="scroll-helper"
        ref={lastUserRef}
        style={{ height: "1px", width: "1px" }}
      ></div>
      {userListData.isLoading && <Employee loading={userListData.isLoading} />}
      {userListData.isError && (
        <>Some error has occured, please contact admin.</>
      )}
    </EmployeeListStyles>
  );
};

export default EmployeeList;
