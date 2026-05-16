import { Hono } from 'hono'
import { type Env } from '../lib/d1'
import { authMiddleware, adminOnly } from '../middlewares/auth'

const backup = new Hono<{ Bindings: Env }>()

backup.use('/*', authMiddleware, adminOnly)

backup.get('/export', async (c) => {
  const requestId = crypto.randomUUID()

  try {
    const db = c.env.DB
    const backupDate = new Date().toISOString()

    const [eventsResult, boothsResult, participantsResult] = await Promise.all([
      db.prepare('SELECT * FROM events ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM booths ORDER BY created_at DESC').all(),
      db.prepare('SELECT * FROM participants ORDER BY created_at DESC').all(),
    ])

    const totalParticipants = participantsResult.results?.length || 0
    const uniqueKeys = new Set((participantsResult.results || []).map((participant: any) => [
      participant.name,
      participant.gender,
      participant.grade,
      participant.date_of_birth,
    ].join('|')))
    const uniqueParticipants = uniqueKeys.size
    const user = c.get('user')

    return c.json({
      backup_date: backupDate,
      version: '1.0',
      system: 'guestbook-system',
      data: {
        events: eventsResult.results || [],
        booths: boothsResult.results || [],
        participants: participantsResult.results || [],
      },
      statistics: {
        total_events: eventsResult.results?.length || 0,
        total_booths: boothsResult.results?.length || 0,
        total_participants: totalParticipants,
        unique_participants: uniqueParticipants,
        duplicate_visits: totalParticipants - uniqueParticipants,
      },
      metadata: {
        exported_by: user?.username || user?.booth_code || 'admin',
        exported_at: backupDate,
        request_id: requestId,
        excludes: ['admins.password_hash'],
      },
    })
  } catch (error) {
    console.error('Backup export error:', { requestId, error })
    return c.json({ error: 'Backup export failed.', request_id: requestId }, 500)
  }
})

backup.post('/import', async (c) => {
  try {
    const body = await c.req.json()

    if (!body.version || !body.data) {
      return c.json({ error: 'Invalid backup file.' }, 400)
    }

    const db = c.env.DB
    const { data } = body
    let importedCount = 0

    if (Array.isArray(data.events)) {
      for (const event of data.events) {
        const result = await db
          .prepare(`
            INSERT OR IGNORE INTO events (id, name, start_date, end_date, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          .bind(event.id, event.name, event.start_date, event.end_date, event.is_active, event.created_at)
          .run()

        importedCount += result.meta.changes || 0
      }
    }

    if (Array.isArray(data.booths)) {
      for (const booth of data.booths) {
        const result = await db
          .prepare(`
            INSERT OR IGNORE INTO booths (id, event_id, name, description, booth_code, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(booth.id, booth.event_id, booth.name, booth.description, booth.booth_code, booth.is_active, booth.created_at)
          .run()

        importedCount += result.meta.changes || 0
      }
    }

    if (Array.isArray(data.participants)) {
      for (const participant of data.participants) {
        const result = await db
          .prepare(`
            INSERT OR IGNORE INTO participants (id, booth_id, name, gender, grade, date_of_birth, has_consented, is_duplicate, attended, attended_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            participant.id,
            participant.booth_id,
            participant.name,
            participant.gender,
            participant.grade,
            participant.date_of_birth,
            participant.has_consented,
            participant.is_duplicate,
            participant.attended || 0,
            participant.attended_at || null,
            participant.created_at,
          )
          .run()

        importedCount += result.meta.changes || 0
      }
    }

    return c.json({
      message: 'Backup import completed.',
      imported_count: importedCount,
      statistics: {
        events: data.events?.length || 0,
        booths: data.booths?.length || 0,
        participants: data.participants?.length || 0,
      },
    })
  } catch (error) {
    console.error('Backup import error:', error)
    return c.json({ error: 'Backup import failed.' }, 500)
  }
})

export default backup
