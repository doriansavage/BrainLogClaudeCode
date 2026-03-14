/**
 * Test Baileys — scan QR code et envoi d'un message WhatsApp
 *
 * Usage :
 *   npx tsx scripts/whatsapp-test.ts
 *
 * Au premier lancement : scanner le QR code avec WhatsApp (Paramètres > Appareils liés)
 * La session est sauvegardée dans scripts/whatsapp-session/ pour ne pas rescanner à chaque fois
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import * as path from 'path'
// @ts-ignore
import qrcode from 'qrcode-terminal'

const SESSION_DIR = path.join(process.cwd(), 'scripts', 'whatsapp-session')

// Numéro destinataire — format international SANS le +
const TEST_RECIPIENT = '32472178831'

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()

  console.log(`Baileys v${version.join('.')} — démarrage...`)

  const sock = makeWASocket({
    version,
    auth: state,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n📱 Scanner ce QR code avec WhatsApp (Paramètres > Appareils liés)\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('\n✅ Connecté à WhatsApp !\n')

      const jid = `${TEST_RECIPIENT}@s.whatsapp.net`
      await sock.sendMessage(jid, { text: 'test message automatique via application claudecode BrainClaudeCode' })
      console.log(`✅ Message envoyé à ${TEST_RECIPIENT}`)

      // On ferme sans logout pour conserver la session
      process.exit(0)
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode
      const shouldReconnect = reason !== DisconnectReason.loggedOut

      if (reason === DisconnectReason.loggedOut) {
        console.log('❌ Déconnecté (logged out) — supprime scripts/whatsapp-session/ et relance')
      } else {
        console.log(`⚠️  Connexion fermée (raison: ${reason}) — reconnexion: ${shouldReconnect}`)
        if (shouldReconnect) connectToWhatsApp()
      }
    }
  })
}

connectToWhatsApp().catch(console.error)
