/**
 * 대기번호 티켓 페이지
 * 방명록 작성 완료 후 대기번호 표시
 */

export function queueTicketPage(
  queueNumber: number,
  currentNumber: number,
  waitingCount: number,
  boothName: string,
  queueId: number,
  isRevisit: boolean = false,
  previousBooth: string | null = null
) {
  const remaining = Math.max(0, queueNumber - currentNumber)
  const isMyTurnSoon = remaining <= 3
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대기번호 - ${boothName}</title>
    <script src="https://cdn.tailwindcss.com">