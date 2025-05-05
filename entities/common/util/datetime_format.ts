/**
 * datetime을 나타내는 수를 입력받고 형식에 맞춰 문자열로 변환
 */
const datetimeFormat = (date: number | undefined, dateType: "date" | "time") => {
  if (!date) {
    if (dateType === "date") return "날짜 선택";
    else return "시간 선택";
  }
  if (dateType === "date")
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  else
    return new Date(date).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
};

export default datetimeFormat;
