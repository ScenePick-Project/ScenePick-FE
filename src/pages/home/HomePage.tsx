import type { SimpleTestDetail } from "../../types/simpleTest.ts";
import type { CommonListResponse } from "../../types/common.ts";
import { useQuery } from "@tanstack/react-query";
import { getApi } from "../../shared/api/common_api.ts";

export default function HomaPage() {
  const simpleTestList = useQuery({
    queryKey: ["SIMPLE_TEST_LIST"],
    queryFn: () =>
      getApi<CommonListResponse<SimpleTestDetail>>("/api/v1/simple/test/list"),
  });

  return (
    <>
      <div>
        <h1>Scene Pick Start! 🎬</h1>
        <p>여기서부터 개발을 시작합니다.</p>
      </div>
      <div>
        {simpleTestList.data?.dataList?.map((item) => (
          <div
            key={item.id}
            className="w-40 border p-4 rounded shadow bg-white"
          >
            <span className="font-bold mr-2">#{item.id}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
