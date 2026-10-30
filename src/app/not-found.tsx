import StatusPage from "@/components/common/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="페이지를 찾을 수 없어요"
      description={
        <>
          주소가 바뀌었거나 삭제된 글일 수 있어요.
          <br />
          홈이나 글 목록에서 다시 찾아보세요.
        </>
      }
    />
  );
}
