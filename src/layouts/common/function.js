export function parseJwt(name) {
  try {
    const jwt = localStorage.getItem("jwt"); // JWT 가져오기
    if (!jwt) return null; // JWT가 없으면 null 반환

    const base64Payload = jwt.split(".")[1]; // payload 부분 추출
    const decodedPayload = atob(base64Payload); // Base64 디코딩
    const payload = JSON.parse(decodedPayload); // JSON 변환

    return payload[name] ?? null; // 해당 키가 없으면 null 반환
  } catch (e) {
    console.error("Invalid JWT:", e);
    return null;
  }
}
