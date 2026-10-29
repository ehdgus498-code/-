module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, birth, job, time, premium, message } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: '이름과 연락처는 필수입니다.' });

  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const html = `
    <h2>신규 보험상담 신청</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif">
      <tr><td style="padding:8px;font-weight:bold">이름</td><td style="padding:8px">${esc(name)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">연락처</td><td style="padding:8px">${esc(phone)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">생년월일</td><td style="padding:8px">${esc(birth)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">직업</td><td style="padding:8px">${esc(job)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">상담 가능 시간</td><td style="padding:8px">${esc(time)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">현재 월 보험료</td><td style="padding:8px">${esc(premium)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">문의내용</td><td style="padding:8px;white-space:pre-wrap">${esc(message)}</td></tr>
    </table>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: '보험상담 접수 <onboarding@resend.dev>',
        to: ['ehdgus498@gmail.com'],
        subject: `[신규 보험상담] ${String(name).slice(0,30)}님`,
        html
      })
    });
    const result = await response.json();
    if (!response.ok) return res.status(500).json({ error: result.message || '메일 발송 실패' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: '서버 오류' });
  }
}
