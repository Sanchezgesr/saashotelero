describe('logAction', () => {
  it('debe exportar la función logAction', async () => {
    const { logAction } = await import('@/lib/audit')
    expect(typeof logAction).toBe('function')
  })

  it('no debe lanzar error si supabase falla', async () => {
    const { logAction } = await import('@/lib/audit')
    const mockSupabase = {
      from: () => ({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('DB error') }) }) }),
      }),
    }
    await expect(
      logAction({
        supabase: mockSupabase as any,
        hotelId: '00000000-0000-0000-0000-000000000000',
        userId: '00000000-0000-0000-0000-000000000000',
        action: 'test.action',
        entity: 'test',
      })
    ).resolves.toBeUndefined()
  })
})
