/**
 * Converts Java signed 32-bit RGB integer colors to CSS hex strings.
 * OPCat stores colors as Java's Color.getRGB() which returns a signed int
 * with alpha in the high byte (typically 0xFF for opaque).
 */
export function javaIntToHex(value: number): string {
  // Convert to unsigned 32-bit, mask out alpha, keep RGB
  const rgb = (value >>> 0) & 0xffffff;
  return '#' + rgb.toString(16).padStart(6, '0');
}
