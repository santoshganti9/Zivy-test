import React, { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TUser } from "@/interfaces/employee";

import Employee from "./employee";

const INITIAL_URL = "https://api.github.com/orgs/mozilla/members";

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

  const getUsers = async (url: string) => {
    try {
      setUserListData((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch(url, {
        headers: {
          Authorization: `${process.env.TOKEN}`,
        },
      });

      //check if next page exists
      const linkHeader = response.headers.get("Link");
      const next = linkHeader
        ?.split(",")
        .find((link) => link.includes('rel="next"'));
      console.log(next);
      if (next) {
        const nextUrl = next.match(/<([^>]+)>/)![1];
        nextLink.current = nextUrl;
      } else {
        nextLink.current = null;
      }

      //setting local state
      const json = await response.json();
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("im inter ", nextLink);
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
  }, []);

  useEffect(() => {
    getUsers(`${INITIAL_URL}?page=${1}`);
  }, []);

  return (
    <div className="user-list-container">
      {userListData.userList?.map((user: TUser) => {
        return (
          <>
            <Employee key={user.id} user={user} />{" "}
          </>
        );
      })}
      <div
        className="scroll-helper"
        ref={lastUserRef}
        style={{ height: "1px", width: "1px" }}
      ></div>
      {userListData.isLoading && <>Loading...</>}
    </div>
  );
};

export default EmployeeList;
