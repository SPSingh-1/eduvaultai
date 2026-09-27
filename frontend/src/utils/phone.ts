/**
 * Validates whether a phone number is an Indian Mobile Number capable of WhatsApp.
 * Indian mobile numbers:
 * - Exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Landlines (0141, 011, 020, 022, etc.) or toll-free/IVR numbers (1800, 99994...) are NOT on WhatsApp.
 */
export function isWhatsAppEligible(phone?: string | null): boolean {
  if (!phone) return false

  let clean = phone.replace(/[^0-9]/g, '')

  // Remove country code 91 if present in a 12-digit number
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.substring(2)
  }

  // Remove leading 0 (e.g. 09823011223 -> 9823011223)
  clean = clean.replace(/^0+/, '')

  // Must be exactly 10 digits
  if (clean.length !== 10) {
    return false
  }

  // Known IVR / non-WhatsApp customer care numbers (e.g. 9999431999)
  if (clean.startsWith('99994') || clean.startsWith('1800')) {
    return false
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  // Landlines (0141 Jaipur -> 141..., 011 Delhi -> 11..., 022 Mumbai -> 22...) will fail this test!
  return /^[6-9]\d{9}$/.test(clean)
}

/**
 * Formats a valid mobile number for WhatsApp Click-to-Chat
 */
export function getWhatsAppUrl(phone: string | undefined | null, message: string): string {
  if (!phone) return '#'
  let clean = phone.replace(/[^0-9]/g, '')
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.substring(2)
  }
  clean = clean.replace(/^0+/, '')
  return `https://wa.me/91${clean}?text=${encodeURIComponent(message)}`
}
