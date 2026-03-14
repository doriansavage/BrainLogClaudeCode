/**
 * Service WhatsApp — envoi de messages via Baileys
 * Session persistée dans scripts/whatsapp-session/
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import * as path from 'path'

const SESSION_DIR = path.join(process.cwd(), 'scripts', 'whatsapp-session')

/** Envoie un message WhatsApp à un numéro (format international sans +, ex: 32479574827) */
export async function sendWhatsAppMessage(toNumber: string, message: string): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  return new Promise((resolve, reject) => {
    const sock = makeWASocket({ version, auth: state })

    sock.ev.on('creds.update', saveCreds)

    const timeout = setTimeout(() => {
      sock.end(undefined)
      reject(new Error('WhatsApp: timeout de connexion'))
    }, 15000)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'open') {
        clearTimeout(timeout)
        try {
          const jid = `${toNumber}@s.whatsapp.net`
          await sock.sendMessage(jid, { text: message })
          sock.end(undefined)
          resolve()
        } catch (err) {
          sock.end(undefined)
          reject(err)
        }
      }

      if (connection === 'close') {
        clearTimeout(timeout)
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode
        if (reason === DisconnectReason.loggedOut) {
          reject(new Error('WhatsApp: session expirée — rescanner le QR code'))
        } else {
          reject(new Error(`WhatsApp: connexion fermée (code ${reason})`))
        }
      }
    })
  })
}
