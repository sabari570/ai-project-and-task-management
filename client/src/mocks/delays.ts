export async function mockDelay(ms = 280): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}