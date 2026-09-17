import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createMoment,
  deleteMoment,
  getMoments,
  updateMoment,
} from "../api/momentApi.ts";
import type {
  MomentCursor,
  MomentInput,
  MomentSlice,
  MomentUpdate,
} from "../types/momentTypes.ts";

export const useMoments = (
  userId: string,
  contentId: number,
  youtubeId: string | null,
) =>
  useInfiniteQuery({
    queryKey: ["moments", userId, "list", contentId, youtubeId],
    queryFn: ({ pageParam }) => getMoments(contentId, youtubeId, pageParam),
    initialPageParam: null as MomentCursor | null,
    getNextPageParam: (page) =>
      page.hasNext && page.nextCursor ? page.nextCursor : undefined,
    retry: false,
    gcTime: 0,
  });

export const useMomentActions = (userId: string, contentId: number) => {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["moments", userId] });

  const create = useMutation({
    gcTime: 0,
    mutationFn: (body: MomentInput) => createMoment(contentId, body),
    onSuccess: refresh,
    retry: false,
  });
  const update = useMutation({
    gcTime: 0,
    mutationFn: ({
      momentId,
      body,
    }: {
      momentId: number;
      body: MomentUpdate;
    }) => updateMoment(momentId, body),
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<MomentSlice>>(
        { queryKey: ["moments", userId] },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              momentList: page.momentList.map((moment) =>
                moment.momentId === updated.momentId ? updated : moment,
              ),
            })),
          },
      );
      return refresh();
    },
    retry: false,
  });
  const remove = useMutation({
    gcTime: 0,
    mutationFn: deleteMoment,
    onSuccess: (_, momentId) => {
      queryClient.setQueriesData<InfiniteData<MomentSlice>>(
        { queryKey: ["moments", userId] },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              momentList: page.momentList.filter(
                (moment) => moment.momentId !== momentId,
              ),
            })),
          },
      );
      return refresh();
    },
    retry: false,
  });
  return { create, update, remove };
};
