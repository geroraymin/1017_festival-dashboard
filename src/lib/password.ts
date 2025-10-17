/**
 * 비밀번호 해싱 및 검증 유틸리티
 * Cloudflare Workers 환경에서 Web Crypto API 사용
 */

/**
 * 비밀번호 해시 생성
 * @param password 원본 비밀번호
 * @returns 해시된 비밀번호 (알고리즘:salt:hash 형식)
 */
export async function hashPassword(password: string): Promise<string> {
  // 랜덤 salt 생성 (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  // 비밀번호를 Uint8Array로 변환
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // salt와 password 결합
  const combined = new Uint8Array(salt.length + passwordData.length)
  combined.set(salt)
  combined.set(passwordData, salt.length)
  
  // PBKDF2를 사용하여 해시 생성
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const hashBuffer = await crypto.subtle.deriveBits(
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
  const saltBase64 = btoa(String.fromCharCode(...salt))
  const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
  
  return `pbkdf2:${saltBase64}:${hashBase64}`
}

/**
 * 비밀번호 검증
 * @param password 원본 비밀번호
 * @param hash 저장된 해시 (알고리즘:salt:hash 형식)
 * @returns 일치 여부
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [algorithm, saltBase64, expectedHashBase64] = hash.split(':')
    
    if (algorithm !== 'pbkdf2') {
      console.error('Unsupported hash algorithm:', algorithm)
      return false
    }
    
    // Base64 디코딩
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
    const expectedHash = Uint8Array.from(atob(expectedHashBase64), c => c.charCodeAt(0))
    
    // 비밀번호를 Uint8Array로 변환
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    
    // 동일한 방식으로 해시 생성
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    )
    
    const actualHash = new Uint8Array(hashBuffer)
    
    // 해시 비교 (타이밍 공격 방지를 위한 constant-time 비교)
    if (actualHash.length !== expectedHash.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < actualHash.length; i++) {
      result |= actualHash[i] ^ expectedHash[i]
    }
    
    return result === 0
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}
