"use client";

import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Avatar from "@/components/avatar/Avatar";
import LoadingModal from "@/components/loading-modal/LoadingModal";

interface UserBoxProps {
  data: any;
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);

    axios
      .post("/api/conversations", {
        userId: data.id,
      })
      .then((response) => {
        router.push(`/conversations/${response.data.id}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [data, router]);

  return (
    <>
      {
        isLoading && (
          <LoadingModal />
        )
      }
      <div
        onClick={handleClick}
        className="
        w-full
        relative
        flex
        items-center
        space-x-3
        bg-white
        p-3
        hover:bg-neutral-100
        rounded-lg
        transition
        cursor-pointer
      "
      >
        <Avatar currentUser={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div className="focus:outline-none">
              <div
                className="
                flex
                justify-between
                items-center
                mb-1
              "
              >
                <p
                  className="
                  text-sm
                  font-medium
                  text-gray-900
                "
                >
                  {data.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
