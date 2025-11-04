/**
 * 비밀번호 해시 생성 스크립트
 * Usage: node scripts/hash-password.mjs <password>
 */
import { webcrypto } from 'crypto'

async function hashPassword(password) {
  // 랜덤 salt 생성 (16 bytes)
  const salt = webcrypto.getRandomValues(new Uint8Array(16))
  
  // 비밀번호를 Uint8Array로 변환
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // PBKDF2를 사용하여 해시 생성
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const hashBuffer = await webcrypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  
  // Base64로 인코딩
  const saltBase64 = Buffer.from(salt).toString('base64')
  const hashBase64 = Buffer.from(new Uint8Array(hashBuffer)).toString('base64')
  
  return `pbkdf2:${saltBase64}:${hashBase64}`
}

const password = process.argv[2] || 'admin1234'

hashPassword(password).then(hash => {
  console.log('Password:', password)
  console.log('Hash:', hash)
}).catch(err => {
  console.error('Error:', err)
})
