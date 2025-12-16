export async function sendEmail(to: string, subject: string, text: string) {
  const payload = { to, subject, text };
  // Mock sender for MVP
  console.log(JSON.stringify(payload));
}
