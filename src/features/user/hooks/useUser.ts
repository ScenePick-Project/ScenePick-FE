import { useQuery } from "@tanstack/react-query";
import { checkLogin } from "@features/user/api/userApi.ts";
import type { UserAuthResponseDto } from "@features/user/types/userType.ts";

export const useCurrentUser = (enabled = true) => {
  return useQuery<UserAuthResponseDto, Error>({
    queryKey: ["user", "me"],
    queryFn: checkLogin,
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
